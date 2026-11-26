using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("Perplexity Companion Launcher")]
[assembly: AssemblyDescription("Prompts for a Perplexity URL, then launches the existing Edge Default profile in app mode. This launcher does no code execution; any code execution is handled by the separate optional native host and extension.")]
[assembly: AssemblyVersion("0.2.0.0")]
[assembly: AssemblyFileVersion("0.2.0.0")]

internal static class Program
{
    private static readonly string[] AllowedHosts = new string[] { "perplexity.ai", "www.perplexity.ai" };

    private static string Validate(string text)
    {
        if (text == null) return null;
        string t = text.Trim();
        if (t.Length == 0 || t.Length > 2048) return null;
        foreach (char c in t)
        {
            if (c <= ' ' || c == '"' || c > '~') return null;
        }
        Uri u;
        if (!Uri.TryCreate(t, UriKind.Absolute, out u)) return null;
        if (u.Scheme != Uri.UriSchemeHttps) return null;
        if (!String.IsNullOrEmpty(u.UserInfo)) return null;
        if (!u.IsDefaultPort) return null;
        if (Array.IndexOf(AllowedHosts, u.Host.ToLowerInvariant()) < 0) return null;
        string abs = u.AbsoluteUri;
        if (abs.IndexOf('"') >= 0) return null;
        return abs;
    }

    private static string Prompt(string initial)
    {
        using (Form form = new Form())
        using (Label label = new Label())
        using (TextBox box = new TextBox())
        using (Button ok = new Button())
        using (Button cancel = new Button())
        {
            form.Text = "Perplexity Companion - open URL";
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.StartPosition = FormStartPosition.CenterScreen;
            form.MinimizeBox = false;
            form.MaximizeBox = false;
            form.ClientSize = new Size(560, 110);
            label.Text = "Perplexity URL (https only, perplexity.ai):";
            label.SetBounds(12, 12, 536, 18);
            box.SetBounds(12, 36, 536, 24);
            box.Text = initial;
            ok.Text = "Open";
            ok.DialogResult = DialogResult.OK;
            ok.SetBounds(392, 72, 75, 28);
            cancel.Text = "Cancel";
            cancel.DialogResult = DialogResult.Cancel;
            cancel.SetBounds(473, 72, 75, 28);
            form.AcceptButton = ok;
            form.CancelButton = cancel;
            form.Controls.AddRange(new Control[] { label, box, ok, cancel });
            ok.Click += delegate
            {
                if (Validate(box.Text) == null)
                {
                    MessageBox.Show(form,
                        "Enter an https URL on perplexity.ai or www.perplexity.ai.",
                        "Perplexity Companion - invalid URL",
                        MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    form.DialogResult = DialogResult.None;
                }
            };
            if (form.ShowDialog() != DialogResult.OK) return null;
            return Validate(box.Text);
        }
    }

    [STAThread]
    private static int Main()
    {
        try
        {
            const string edge =
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            const string userData =
                @"C:\Users\nicka\AppData\Local\Microsoft\Edge\User Data";
            const string profile = "Default";
            const string defaultAddress = "https://www.perplexity.ai/";

            if (!File.Exists(edge))
                throw new FileNotFoundException("The configured Edge executable was not found.", edge);

            string currentUserData = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                @"Microsoft\Edge\User Data");

            if (!String.Equals(
                Path.GetFullPath(currentUserData).TrimEnd('\\'),
                Path.GetFullPath(userData).TrimEnd('\\'),
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "This prototype is configured for the verified Windows user. " +
                    "It will not open another user's Edge profile.");
            }

            if (!Directory.Exists(Path.Combine(userData, profile)))
                throw new DirectoryNotFoundException(
                    "The configured existing Edge Default profile was not found. " +
                    "No replacement profile will be created by this launcher.");

            string companionRoot = AppDomain.CurrentDomain.BaseDirectory;
            foreach (string name in new string[] { "manifest.json", "inspect.js", "background.js" })
            {
                if (!File.Exists(Path.Combine(companionRoot, name)))
                    throw new FileNotFoundException(
                        "Keep this executable beside the Companion extension files.", name);
            }

            Application.EnableVisualStyles();
            string address = Prompt(defaultAddress);
            if (address == null) return 0;

            ProcessStartInfo start = new ProcessStartInfo();
            start.FileName = edge;
            start.Arguments =
                "--user-data-dir=\"" + userData + "\" " +
                "--profile-directory=\"" + profile + "\" " +
                "--app=\"" + address + "\"";
            start.UseShellExecute = false;
            start.WorkingDirectory = Path.GetDirectoryName(edge);

            Process launched = Process.Start(start);
            if (launched == null)
                throw new InvalidOperationException("Edge did not return a process handle.");
            launched.Dispose();
            return 0;
        }
        catch (Exception error)
        {
            MessageBox.Show(
                error.Message,
                "Perplexity Companion - launch failed",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            return 1;
        }
    }
}