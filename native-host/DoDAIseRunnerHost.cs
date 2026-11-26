using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

[assembly: System.Reflection.AssemblyTitle("DoDA ISE Runner Native Host")]
[assembly: System.Reflection.AssemblyDescription("Native Messaging host for the Perplexity Reader Companion. Accepts messages only from the allow-listed extension, pastes text into the oldest open PowerShell ISE window, and presses F5 only when the message asks for it.")]

static class Host
{
    const int HeaderSize = 4;
    const int MaxChars = 200000;
    [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr h, int cmd);
    [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
    [DllImport("user32.dll")] static extern bool AttachThreadInput(uint a, uint b, bool attach);
    [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();

    static string LogPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "host.log");
    static void Log(string s) { try { File.AppendAllText(LogPath, DateTime.Now.ToString("o") + " " + s + Environment.NewLine); } catch { } }

    static byte[] ReadExact(Stream s, int n)
    {
        byte[] buf = new byte[n]; int got = 0;
        while (got < n) { int r = s.Read(buf, got, n - got); if (r <= 0) return null; got += r; }
        return buf;
    }
    static void Send(Stream o, Dictionary<string, object> d)
    {
        byte[] body = Encoding.UTF8.GetBytes(new JavaScriptSerializer().Serialize(d));
        byte[] hdr = BitConverter.GetBytes(body.Length);
        o.Write(hdr, 0, hdr.Length); o.Write(body, 0, body.Length); o.Flush();
    }
    static Dictionary<string, object> Fail(string action, string msg)
    {
        var r = new Dictionary<string, object>();
        r["action"] = action; r["ok"] = false; r["error"] = msg; return r;
    }
    static string ShaOf(string s)
    {
        StringBuilder sb = new StringBuilder();
        foreach (byte b in SHA256.Create().ComputeHash(Encoding.UTF8.GetBytes(s))) sb.Append(b.ToString("X2"));
        return sb.ToString();
    }
    static string ClipText()
    {
        try { return Clipboard.ContainsText() ? Clipboard.GetText() : ""; } catch { return ""; }
    }
    static Process FindIse()
    {
        Process best = null; DateTime bestT = DateTime.MaxValue;
        foreach (Process p in Process.GetProcessesByName("powershell_ise"))
        {
            try { if (p.MainWindowHandle == IntPtr.Zero) continue; DateTime t = p.StartTime; if (t < bestT) { bestT = t; best = p; } } catch { }
        }
        return best;
    }
    static bool Focus(IntPtr h)
    {
        if (IsIconic(h)) ShowWindow(h, 9);
        uint pid; IntPtr fg = GetForegroundWindow();
        uint fgT = GetWindowThreadProcessId(fg, out pid); uint me = GetCurrentThreadId();
        bool att = false;
        if (fgT != me) att = AttachThreadInput(me, fgT, true);
        SetForegroundWindow(h);
        if (att) AttachThreadInput(me, fgT, false);
        Thread.Sleep(300);
        return GetForegroundWindow() == h;
    }
    static Dictionary<string, object> Deliver(string action, Process ise, string code, bool exec, bool setClip, Dictionary<string, object> r)
    {
        string sha = ShaOf(code);
        Log(action + " isePid=" + ise.Id + " chars=" + code.Length + " execute=" + exec + " sha256=" + sha);
        IntPtr h = ise.MainWindowHandle;
        if (!Focus(h)) return Fail(action, "Could not bring the ISE window to the front. Nothing pasted.");
        if (setClip)
        {
            try { Clipboard.SetText(code); } catch (Exception ex) { return Fail(action, "Clipboard failed: " + ex.Message); }
        }
        // reuse the current script tab: select all and paste over it (no new tab)
        SendKeys.SendWait("^i"); Thread.Sleep(500);
        if (GetForegroundWindow() != h) return Fail(action, "ISE lost focus before pasting. Nothing pasted.");
        SendKeys.SendWait("^a"); Thread.Sleep(150);
        SendKeys.SendWait("^v"); Thread.Sleep(500);
        if (exec)
        {
            if (GetForegroundWindow() != h) return Fail(action, "ISE lost focus before running. Code was pasted but not run.");
            SendKeys.SendWait("{F5}");
        }
        r["ok"] = true; r["pasted"] = true; r["executed"] = exec; r["chars"] = code.Length; r["sha256"] = sha;
        return r;
    }
    static Dictionary<string, object> Handle(Dictionary<string, object> m)
    {
        string action = m.ContainsKey("action") ? Convert.ToString(m["action"]) : "";
        if (action != "ping" && action != "run" && action != "peek" && action != "run-clipboard" && action != "await-clipboard") return Fail(action, "Unknown action.");
        if (action == "await-clipboard")
        {
            string notSha = m.ContainsKey("notSha256") ? Convert.ToString(m["notSha256"]) : "";
            int waitMs = 25000;
            if (m.ContainsKey("timeoutMs")) { try { waitMs = Convert.ToInt32(m["timeoutMs"]); } catch { waitMs = 25000; } }
            if (waitMs < 1000) waitMs = 1000;
            if (waitMs > 30000) waitMs = 30000;
            var rr = new Dictionary<string, object>();
            rr["action"] = action;
            DateTime until = DateTime.UtcNow.AddMilliseconds(waitMs);
            while (true)
            {
                string t = ClipText();
                if (!string.IsNullOrWhiteSpace(t) && !string.Equals(ShaOf(t), notSha, StringComparison.OrdinalIgnoreCase) && !string.Equals(ShaOf(t.Replace("\r\n", "\n")), notSha, StringComparison.OrdinalIgnoreCase))
                {
                    if (t.Length > MaxChars) { rr["ok"] = false; rr["error"] = "Clipboard text is longer than the limit. Not returned."; rr["chars"] = t.Length; return rr; }
                    rr["ok"] = true; rr["changed"] = true; rr["text"] = t; rr["chars"] = t.Length; rr["sha256"] = ShaOf(t);
                    Log("await-clipboard changed chars=" + t.Length);
                    return rr;
                }
                if (DateTime.UtcNow >= until) { rr["ok"] = true; rr["changed"] = false; return rr; }
                Thread.Sleep(250);
            }
        }
        Process ise = FindIse();
        if (ise == null) return Fail(action, "No PowerShell ISE window found.");
        var r = new Dictionary<string, object>();
        r["action"] = action; r["isePid"] = ise.Id; r["iseStart"] = ise.StartTime.ToString("o");
        if (action == "ping") { r["ok"] = true; return r; }
        bool exec = m.ContainsKey("execute") && (m["execute"] is bool) && (bool)m["execute"];
        if (action == "peek")
        {
            string t = ClipText();
            if (string.IsNullOrWhiteSpace(t)) return Fail(action, "The clipboard has no text.");
            string first = "";
            foreach (string ln in t.Split('\n')) { if (ln.Trim().Length > 0) { first = ln.Trim(); break; } }
            if (first.Length > 120) first = first.Substring(0, 120);
            r["ok"] = true; r["chars"] = t.Length; r["lines"] = t.Split('\n').Length; r["first"] = first; r["sha256"] = ShaOf(t);
            return r;
        }
        string code; bool setClip;
        if (action == "run")
        {
            code = m.ContainsKey("code") ? Convert.ToString(m["code"]) : "";
            setClip = true;
        }
        else
        {
            string expect = m.ContainsKey("expectSha256") ? Convert.ToString(m["expectSha256"]) : "";
            code = ClipText();
            setClip = false;
            if (string.IsNullOrWhiteSpace(code)) return Fail(action, "The clipboard has no text.");
            if (!string.Equals(ShaOf(code), expect, StringComparison.OrdinalIgnoreCase)) return Fail(action, "The clipboard changed since the preview. Nothing pasted.");
        }
        if (string.IsNullOrWhiteSpace(code)) return Fail(action, "Empty code. Nothing pasted.");
        if (code.Length > MaxChars) return Fail(action, "Code is longer than the limit. Nothing pasted.");
        return Deliver(action, ise, code, exec, setClip, r);
    }
    [STAThread]
    static int Main()
    {
        Stream i = Console.OpenStandardInput(); Stream o = Console.OpenStandardOutput();
        try
        {
            byte[] hdr = ReadExact(i, HeaderSize);
            if (hdr == null) return 0;
            int n = BitConverter.ToInt32(hdr, 0);
            if (n <= 0 || n > 4194304) { Send(o, Fail("", "Bad message length.")); return 1; }
            byte[] body = ReadExact(i, n);
            if (body == null) return 1;
            JavaScriptSerializer ser = new JavaScriptSerializer(); ser.MaxJsonLength = int.MaxValue;
            var m = ser.Deserialize<Dictionary<string, object>>(Encoding.UTF8.GetString(body));
            Send(o, Handle(m));
        }
        catch (Exception ex) { Log("error " + ex.Message); try { Send(o, Fail("", ex.Message)); } catch { } return 1; }
        return 0;
    }
}