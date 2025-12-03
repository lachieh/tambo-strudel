"use client";

import { cn } from "@/lib/utils";
import {
  useTamboComponentState,
  useTamboStreamStatus,
} from "@tambo-ai/react";
import * as React from "react";
import { z } from "zod";

/**
 * Custom hook to sync streaming props to state with merge logic.
 * Uses value-spreading for dependencies to avoid infinite loops from object reference changes.
 */
function useStreamingPropsWithMerge<T, P>(
  currentState: T | undefined,
  setState: (state: T) => void,
  streamingProps: P,
  mergeStrategy: (current: T | undefined, incoming: P) => T
): void {
  // Spread values for stable dependency tracking (avoids object identity issues)
  const propValues = Object.values(streamingProps as Record<string, unknown>);

  React.useEffect(() => {
    const hasIncomingData = Object.values(streamingProps as Record<string, unknown>).some(v => v !== undefined);
    if (!hasIncomingData) return;

    const merged = mergeStrategy(currentState, streamingProps);
    setState(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...propValues]);
}

/**
 * Schema for a selection group (label + options only - no selected field)
 * The AI defines the groups and options, user controls selections
 */
const selectionGroupSchema = z.object({
  label: z.string().describe("The label/title for this group"),
  options: z
    .array(z.string())
    .describe("Array of option values that can be selected in this group"),
});

/**
 * Zod schema for MultiSelectForm props (AI-controlled)
 * Note: `selected` is NOT included - that's user-controlled state
 */
export const multiSelectFormSchema = z.object({
  title: z
    .string()
    .optional()
    .describe("Optional title displayed at the top of the form"),
  groups: z
    .array(selectionGroupSchema)
    .describe("Array of selection groups, each with a label and selectable options"),
});

export type MultiSelectFormProps = z.infer<typeof multiSelectFormSchema>;

/**
 * Internal group type that includes user selections
 */
interface GroupWithSelection {
  label: string;
  options: string[];
  selected: string[];
}

/**
 * State tracked by Tambo - includes user selections so AI can see what user picked
 */
interface MultiSelectState {
  title: string;
  groups: GroupWithSelection[];
}

/**
 * MultiSelectForm component for selecting items from categorized groups
 * Uses Tambo state to sync selections with AI context
 * Supports multi-selection within each group
 */
export const MultiSelectForm = React.forwardRef<
  HTMLDivElement,
  MultiSelectFormProps
>(({ title, groups }, ref) => {
  // Track streaming status for this component
  const { streamStatus, propStatus } = useTamboStreamStatus<MultiSelectFormProps>();

  // Use Tambo state so AI can track user selections
  // This state includes `selected` arrays that the user controls
  const [state, setState] = useTamboComponentState<MultiSelectState>(
    "multiSelectState",
    {
      title: "",
      groups: [],
    }
  );

  // Type for streaming props we receive
  type StreamingProps = { title: string | undefined; groups: typeof groups };

  // Merge strategy that preserves user selections when new groups stream in
  const mergeGroupsWithSelections = React.useCallback(
    (current: MultiSelectState | undefined, incoming: StreamingProps): MultiSelectState => {
      const incomingGroups = incoming.groups ?? [];
      const existingGroups = current?.groups ?? [];

      const mergedGroups: GroupWithSelection[] = incomingGroups.map((incomingGroup) => {
        const existingGroup = existingGroups.find((g) => g.label === incomingGroup.label);
        return {
          label: incomingGroup.label,
          options: incomingGroup.options ?? [],
          selected: existingGroup?.selected ?? [],
        };
      });

      return {
        title: incoming.title ?? current?.title ?? "",
        groups: mergedGroups,
      };
    },
    []
  );

  // Sync streamed props to state using value-spreading to avoid infinite loops
  useStreamingPropsWithMerge<MultiSelectState, StreamingProps>(
    state,
    setState,
    { title, groups },
    mergeGroupsWithSelections
  );

  // Get current values from state
  const currentTitle = state?.title || title || "";
  const currentGroups = state?.groups ?? [];

  const updateSelections = (groupIndex: number, newSelected: string[]) => {
    const newGroups = currentGroups.map((g, i) =>
      i === groupIndex ? { ...g, selected: newSelected } : g
    );
    setState({
      title: state?.title ?? "",
      groups: newGroups,
    });
  };

  const toggleOption = (groupIndex: number, option: string) => {
    const group = currentGroups[groupIndex];
    if (!group) return;

    const currentSelected = group.selected ?? [];
    const isSelected = currentSelected.includes(option);
    const newSelected = isSelected
      ? currentSelected.filter((s) => s !== option)
      : [...currentSelected, option];

    updateSelections(groupIndex, newSelected);
  };

  const clearGroup = (groupIndex: number) => {
    updateSelections(groupIndex, []);
  };

  const clearAll = () => {
    const newGroups = currentGroups.map((g) => ({ ...g, selected: [] }));
    setState({
      title: state?.title ?? "",
      groups: newGroups,
    });
  };

  const hasAnySelections = currentGroups.length > 0 && currentGroups.some(
    (group) => group?.selected && group.selected.length > 0
  );

  // Show loading state while pending
  if (streamStatus.isPending) {
    return (
      <div
        ref={ref}
        className="w-full rounded-lg border border-border bg-card p-4"
      >
        <div className="text-sm text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  // Show partial content while streaming, or full content when done
  return (
    <div
      ref={ref}
      className="w-full rounded-lg border border-border bg-card p-4 space-y-4"
    >
      {/* Header */}
      {(currentTitle || hasAnySelections) && (
        <div className="flex items-center justify-between">
          {currentTitle && (
            <h3 className={cn(
              "text-sm font-medium text-foreground",
              propStatus.title?.isStreaming && "animate-pulse"
            )}>
              {currentTitle}
            </h3>
          )}
          {hasAnySelections && !streamStatus.isStreaming && (
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Groups */}
      {currentGroups.length === 0 && streamStatus.isStreaming && (
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading options...
        </div>
      )}

      {currentGroups.map((group, groupIndex) => {
        // Guard against partially streamed group objects
        if (!group?.label) {
          return null;
        }

        const groupSelected = group.selected ?? [];
        const groupOptions = group.options ?? [];

        return (
          <div key={`${group.label}-${groupIndex}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm font-medium text-foreground",
                propStatus.groups?.isStreaming && "animate-pulse"
              )}>
                {group.label}
              </span>
              {groupSelected.length > 0 && !streamStatus.isStreaming && (
                <button
                  onClick={() => clearGroup(groupIndex)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {groupOptions.map((option) => {
                if (!option) return null;
                const isSelected = groupSelected.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(groupIndex, option)}
                    disabled={streamStatus.isStreaming}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm transition-all duration-150",
                      "border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
              {propStatus.groups?.isStreaming && (
                <span className="px-3 py-1.5 text-sm text-muted-foreground animate-pulse">...</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Selected summary */}
      {hasAnySelections && (
        <div className="pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">Selected: </span>
          <span className="text-xs text-foreground">
            {currentGroups
              .filter((group) => group?.selected && group.selected.length > 0)
              .map((group) => `${group.label}: ${group.selected.join(", ")}`)
              .join(" | ")}
          </span>
        </div>
      )}

      {/* Error state */}
      {streamStatus.isError && streamStatus.streamError && (
        <div className="pt-3 text-xs text-destructive">
          Error: {streamStatus.streamError.message}
        </div>
      )}
    </div>
  );
});

MultiSelectForm.displayName = "MultiSelectForm";
