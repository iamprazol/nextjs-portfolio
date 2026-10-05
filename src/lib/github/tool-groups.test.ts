import { describe, expect, it } from "vitest";

import type { ToolUsage } from "./schemas";
import { groupTools } from "./tool-groups";

const tool = (name: string, kind: ToolUsage["kind"] = "language"): ToolUsage => ({
    name,
    kind,
    systems: [{ slug: "atlas", name: "Atlas" }]
});

describe("groupTools", () => {
    it("files tools under the fixed groups, in the groups' order, keeping tool order", () => {
        const groups = groupTools([
            tool("llm", "topic"),
            tool("TypeScript"),
            tool("PHP"),
            tool("playwright", "topic"),
            tool("CSS"),
            tool("wordpress", "topic")
        ]);

        expect(groups.map((group) => [group.name, group.tools.map((item) => item.name)])).toEqual([
            ["Backend", ["PHP", "wordpress"]],
            ["Frontend", ["TypeScript", "CSS"]],
            ["Engineering", ["playwright"]],
            ["AI / Automation", ["llm"]]
        ]);
    });

    it("keeps an unknown language but leaves out an unknown topic", () => {
        expect(groupTools([tool("Zig"), tool("membership", "topic")])).toEqual([
            { name: "Engineering", tools: [tool("Zig")] }
        ]);
    });

    it("drops empty groups", () => {
        expect(groupTools([])).toEqual([]);
        expect(groupTools([tool("Go")]).map((group) => group.name)).toEqual(["Backend"]);
    });
});
