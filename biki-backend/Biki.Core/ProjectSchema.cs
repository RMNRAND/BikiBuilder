namespace Biki.Core;

// This represents all data stored in a project.

public class BikiProject
{
    public ProjectMetadata Metadata { get; set; } = new();
    public List<BikiPage> Pages { get; set; } = new();
    public List<BikiAsset> AssetManifest { get; set; } = new();
}

public class ProjectMetadata
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "Untitled Site";
    public string Version { get; set; } = "1.0.0";
    public DateTime LastModified { get; set; } = DateTime.UtcNow;
}

public class BikiPage
{
    public string Route { get; set; } = "/home"; // e.g., index, about, contact
    public List<UIElement> RootElements { get; set; } = new();
}

public class UIElement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = "div"; // div, button, h1, section, img
    public Dictionary<string, string> Styles { get; set; } = new(); // Tailwind or CSS rules
    public Dictionary<string, string> Attributes { get; set; } = new(); // src, href, alt
    public List<UIElement> Children { get; set; } = new(); // Nested elements
}

public class BikiAsset
{
    public string LocalPath { get; set; } = ""; // where it lives in the workspace
    public string Type { get; set; } = ""; // image/png, font/woff2
}