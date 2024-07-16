import { expect, jest, test, describe, beforeEach, afterEach } from "bun:test";
import { FileReadWriteNode } from "../src/Files/ReadWriteFile/ReadWriteFile.node";
import * as fs from "fs/promises";
import * as path from "path";

describe("FileReadWriteNode", () => {
  let node: FileReadWriteNode;
  let mockExecuteFunctions: any;

  beforeEach(() => {
    node = new FileReadWriteNode();
    mockExecuteFunctions = {
      getInputData: jest.fn(),
      getNodeParameter: jest.fn(),
    };

    // Mock fs/promises methods
    (fs.readFile as unknown) = jest.fn();
    (fs.writeFile as unknown) = jest.fn();

    // Mock path.resolve
    (path.resolve as unknown) = jest.fn((filePath) => filePath);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should read a file successfully", async () => {
    const mockFileContent = "Hello, World!";
    (fs.readFile as jest.Mock).mockResolvedValue(mockFileContent);

    mockExecuteFunctions.getInputData.mockReturnValue([{}]);
    mockExecuteFunctions.getNodeParameter.mockImplementation(
      (paramName: string) => {
        if (paramName === "operation") return "read";
        if (paramName === "filePath") return "/path/to/file.txt";
        return "";
      },
    );

    const result = await node.execute.call(mockExecuteFunctions);

    expect(result).toEqual([{ json: { data: mockFileContent } }]);
    expect(fs.readFile).toHaveBeenCalledWith("/path/to/file.txt", "utf-8");
  });

  test("should write to a file successfully", async () => {
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    mockExecuteFunctions.getInputData.mockReturnValue([{}]);
    mockExecuteFunctions.getNodeParameter.mockImplementation(
      (paramName: string) => {
        if (paramName === "operation") return "write";
        if (paramName === "filePath") return "/path/to/file.txt";
        if (paramName === "fileContent") return "New content";
        return "";
      },
    );

    const result = await node.execute.call(mockExecuteFunctions);

    expect(result).toEqual([{ json: { status: "success" } }]);
    expect(fs.writeFile).toHaveBeenCalledWith(
      "/path/to/file.txt",
      "New content",
      "utf-8",
    );
  });

  test("should handle read errors", async () => {
    const mockError = new Error("File not found");
    (fs.readFile as jest.Mock).mockRejectedValue(mockError);

    mockExecuteFunctions.getInputData.mockReturnValue([{}]);
    mockExecuteFunctions.getNodeParameter.mockImplementation(
      (paramName: string) => {
        if (paramName === "operation") return "read";
        if (paramName === "filePath") return "/path/to/nonexistent.txt";
        return "";
      },
    );

    const result = await node.execute.call(mockExecuteFunctions);

    expect(result).toEqual([{ json: { error: "File not found" } }]);
  });

  test("should handle write errors", async () => {
    const mockError = new Error("Permission denied");
    (fs.writeFile as jest.Mock).mockRejectedValue(mockError);

    mockExecuteFunctions.getInputData.mockReturnValue([{}]);
    mockExecuteFunctions.getNodeParameter.mockImplementation(
      (paramName: string) => {
        if (paramName === "operation") return "write";
        if (paramName === "filePath") return "/path/to/readonly.txt";
        if (paramName === "fileContent") return "New content";
        return "";
      },
    );

    const result = await node.execute.call(mockExecuteFunctions);

    expect(result).toEqual([{ json: { error: "Permission denied" } }]);
  });

  test("should handle invalid operations", async () => {
    mockExecuteFunctions.getInputData.mockReturnValue([{}]);
    mockExecuteFunctions.getNodeParameter.mockImplementation(
      (paramName: string) => {
        if (paramName === "operation") return "invalid";
        return "";
      },
    );

    const result = await node.execute.call(mockExecuteFunctions);

    expect(result).toEqual([{ json: { error: "Invalid operation" } }]);
  });

  test("should process multiple items", async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce("Content 1");
    (fs.writeFile as jest.Mock).mockResolvedValueOnce(undefined);

    mockExecuteFunctions.getInputData.mockReturnValue([{}, {}]);
    mockExecuteFunctions.getNodeParameter.mockImplementation(
      (paramName: string, itemIndex: number) => {
        if (paramName === "operation")
          return itemIndex === 0 ? "read" : "write";
        if (paramName === "filePath")
          return `/path/to/file${itemIndex + 1}.txt`;
        if (paramName === "fileContent") return "New content";
        return "";
      },
    );

    const result = await node.execute.call(mockExecuteFunctions);

    expect(result).toEqual([
      { json: { data: "Content 1" } },
      { json: { status: "success" } },
    ]);
  });
});
