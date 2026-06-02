using System;
using System.IO;
using System.IO.Compression;
using System.Text.Json;
using Biki.Core; // Allows us to see the BikiProject data schema

namespace Biki.IO;

public class BikiArchiveService
{
    private readonly JsonSerializerOptions _jsonOptions = new() 
    { 
        WriteIndented = true // Makes the project.json readable if opened manually
    };

    /// <summary>
    /// Takes a live memory project and a local assets folder, and packages them into a single .bk file.
    /// </summary>
    public void ExportToBk(BikiProject project, string looseAssetsFolder, string destinationBkFilePath)
    {
        // 1. Create a temporary scratch workspace folder on the Mac SSD
        string tempWorkspace = Path.Combine(Path.GetTempPath(), "BikiExport_" + Guid.NewGuid());
        string tempAssetsDir = Path.Combine(tempWorkspace, "assets");
        
        Directory.CreateDirectory(tempWorkspace);
        Directory.CreateDirectory(tempAssetsDir);

        try
        {
            // 2. Serialize the BikiProject memory blueprint into a project.json text file
            string jsonString = JsonSerializer.Serialize(project, _jsonOptions);
            string jsonPath = Path.Combine(tempWorkspace, "project.json");
            File.WriteAllText(jsonPath, jsonString);

            // 3. Copy loose asset files (images, fonts) into the temp bundle folder if they exist
            if (Directory.Exists(looseAssetsFolder))
            {
                foreach (var file in Directory.GetFiles(looseAssetsFolder))
                {
                    string destFile = Path.Combine(tempAssetsDir, Path.GetFileName(file));
                    File.Copy(file, destFile, overwrite: true);
                }
            }

            // 4. Ensure old file is deleted if overwriting an existing export
            if (File.Exists(destinationBkFilePath))
            {
                File.Delete(destinationBkFilePath);
            }

            // 5. Smash the temp folder layout into our single zipped .bk destination file
            ZipFile.CreateFromDirectory(tempWorkspace, destinationBkFilePath, CompressionLevel.Optimal, includeBaseDirectory: false);
        }
        finally
        {
            // 6. Clean up our temporary scratchpad files off the Mac entirely
            if (Directory.Exists(tempWorkspace))
            {
                Directory.Delete(tempWorkspace, recursive: true);
            }
        }
    }

    /// <summary>
    /// Takes a .bk bundle file, extracts it into a workspace directory, and returns the project blueprint data to Core memory.
    /// </summary>
    public BikiProject ImportFromBk(string sourceBkFilePath, string targetWorkspaceFolder)
    {
        if (!File.Exists(sourceBkFilePath))
        {
            throw new FileNotFoundException($"The archive file target was not found at: {sourceBkFilePath}");
        }

        // 1. Clear or prepare the target editor workspace folder
        if (Directory.Exists(targetWorkspaceFolder))
        {
            Directory.Delete(targetWorkspaceFolder, recursive: true);
        }
        Directory.CreateDirectory(targetWorkspaceFolder);

        // 2. Unpack the compressed .bk archive layout straight into the loose editor workspace
        ZipFile.ExtractToDirectory(sourceBkFilePath, targetWorkspaceFolder);

        // 3. Locate the project JSON data roadmap file
        string jsonPath = Path.Combine(targetWorkspaceFolder, "project.json");
        if (!File.Exists(jsonPath))
        {
            throw new InvalidDataException("Corrupted .bk bundle file. Missing critical 'project.json' manifest mapping.");
        }

        // 4. Read the text payload and reconstruct the active BikiProject instance in system RAM
        string jsonString = File.ReadAllText(jsonPath);
        BikiProject deserializedProject = JsonSerializer.Deserialize<BikiProject>(jsonString) 
            ?? throw new NullReferenceException("Failed to decode the project JSON architecture metadata stream.");

        return deserializedProject;
    }
}