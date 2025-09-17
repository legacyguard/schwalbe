import React from 'react';
export declare const Tabs: React.FC<{
    defaultValue?: string;
    className?: string;
    value?: string;
    onValueChange?: (v: string) => void;
    children?: React.ReactNode;
}>;
export declare const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
}>;
export declare const TabsTrigger: React.FC<{
    value: string;
    children?: React.ReactNode;
}>;
export declare const TabsContent: React.FC<{
    value: string;
    className?: string;
    children?: React.ReactNode;
}>;
//# sourceMappingURL=tabs.d.ts.map