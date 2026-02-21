import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { User } from "../types/User";

type ResultsGraphProps = {
    users: User[];
};

export default function ResultsGraph({ users }: ResultsGraphProps) {
    const colorClasses = {
        1: "#48BB78", // Green
        2: "#81E6D9", // Teal
        3: "#D53F8C", // Pink
        5: "#ECC94B", // Yellow
        8: "#ED8936", // Orange
        13: "#E53E3E", // Red
        21: "#667EEA", // Indigo
    };

    const pointsCount = users.reduce((acc, user) => {
        if (user.points === 0) return acc;
        acc[user.points] = (acc[user.points] || 0) + 1;
        return acc;
    }, {});

    const data = Object.keys(pointsCount).map((points, index) => ({
        name: points,
        value: pointsCount[points],
        fill: colorClasses[points],
    }));

    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                    dataKey="value"
                    data={data}
                    labelLine={false}
                    label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                {/* <Tooltip /> */}
            </PieChart>
        </ResponsiveContainer>
    );
}
