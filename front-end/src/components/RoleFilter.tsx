import React from "react";
import { Role } from "../types/Role";

type RoleFilterProps = {
    roleFilter: Role[];
    setRoleFilter: (role: Role[]) => void;
};

export default function RoleFilter({
    roleFilter,
    setRoleFilter,
}: RoleFilterProps) {
    const handleSelect = (role: Role) => {
        if (roleFilter.includes(role)) {
            setRoleFilter(roleFilter.filter((r) => r !== role));
        } else {
            setRoleFilter([...roleFilter, role]);
        }
    };

    const getColorClass = (role: Role) => {
        let colorClass;
        switch (role) {
            case Role.FrontEnd:
                colorClass = "text-violet-500";
                break;
            case Role.BackEnd:
                colorClass = "text-emerald-500";
                break;
            case Role.QA:
                colorClass = "text-blue-500";
                break;
            case Role.DevOps:
                colorClass = "text-yellow-500";
                break;
            default:
                colorClass = "text-gray-500";
        }
        return colorClass;
    };

    return (
        <div>
            {Object.values(Role)
                .filter((role) => role !== Role.Presenter)
                .map((role, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelect(role)}
                        className={`px-2 py-1 rounded-full m-1 text-sm ${getColorClass(
                            role
                        )} ${
                            roleFilter.includes(role)
                                ? "bg-gray-300"
                                : "bg-gray-100"
                        }`}
                    >
                        {role
                            .split("_")
                            .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                            )
                            .join(" ")}
                    </button>
                ))}
        </div>
    );
}
