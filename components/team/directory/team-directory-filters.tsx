"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { TEAM_DEPARTMENTS, TEAM_DESIGNATIONS } from "@/types/team-directory";

type TeamDirectoryFiltersProps = {
  nameQuery: string;
  emailQuery: string;
  department: string;
  status: string;
  role: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onDepartmentChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onRoleChange: (v: string) => void;
};

const selectClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20";

export function TeamDirectoryFilters({
  nameQuery,
  emailQuery,
  department,
  status,
  role,
  onNameChange,
  onEmailChange,
  onDepartmentChange,
  onStatusChange,
  onRoleChange,
}: TeamDirectoryFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-5">
      <div className="relative lg:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={nameQuery}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Search by name..."
          className="pl-10"
        />
      </div>
      <div className="relative lg:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={emailQuery}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Search by email..."
          className="pl-10"
        />
      </div>
      <select
        value={department}
        onChange={(e) => onDepartmentChange(e.target.value)}
        className={selectClass}
        aria-label="Filter by department"
      >
        {TEAM_DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        className={selectClass}
        aria-label="Filter by role"
      >
        <option value="all">All Roles</option>
        {TEAM_DESIGNATIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}
