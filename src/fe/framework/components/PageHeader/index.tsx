"use client";

import React from "react";
import { Paper, Typography } from "@/components/ui/Component";

interface PageHeaderProps {
    /** Page title rendered as an h4 */
    title: string;
    /** Optional subtitle shown below the title */
    subtitle?: string;
    /**
     * Slot for page-specific controls: search bars, buttons, filters, etc.
     * Each page passes its own ActionBar here — PageHeader stays generic.
     */
    children?: React.ReactNode;
    /** Extra className applied to the outer Paper */
    className?: string;
}

/**
 * PageHeader – shared top-of-page chrome used by every module.
 *
 * Mirrors the existing UsersPageActionBar look (gradient Paper + bold title)
 * but is open for extension via `children` so each page can slot in
 * its own action bar without touching this component.
 *
 * @example
 * <PageHeader title="Users">
 *   <UsersActionBar search={search} onSearchChange={…} onAdd={…} saving={saving} />
 * </PageHeader>
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children, className = "" }) => {
    return (
        <Paper
            elevation={2}
            className={`p-4 sm:p-6 md:p-8 rounded-lg mb-4 mt-2 bg-gradient-to-br from-white to-slate-50 overflow-hidden ${className}`}
        >
            <Typography
                variant="h4"
                className="font-extrabold text-gray-900 text-2xl sm:text-3xl md:text-4xl mb-1 text-center sm:text-left"
            >
                {title}
            </Typography>

            {subtitle && (
                <Typography variant="body2" className="text-gray-500 text-sm mb-3 text-center sm:text-left">
                    {subtitle}
                </Typography>
            )}

            {children && <div className="mt-3">{children}</div>}
        </Paper>
    );
};

export default PageHeader;
