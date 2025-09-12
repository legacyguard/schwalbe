export interface SnapshotListItem {
    id: string;
    label?: string;
    timestamp: string;
}
interface SnapshotHistoryListProps {
    items: SnapshotListItem[];
    onSelect?: (id: string) => void;
}
export declare function SnapshotHistoryList({ items, onSelect }: SnapshotHistoryListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SnapshotHistoryList.d.ts.map