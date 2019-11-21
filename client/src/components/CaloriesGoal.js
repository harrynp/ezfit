import React, { useState, useEffect } from "react";
import { PieChart, Pie, Label, ResponsiveContainer, Tooltip } from 'recharts';

function CustomLabel({viewBox, value1, value2}){
    const {cx, cy} = viewBox;
    return (
     <text x={cx} y={cy} fill="#3d405c" className="recharts-text recharts-label" textAnchor="middle" dominantBaseline="central">
        <tspan alignmentBaseline="middle" fontSize="26" x="50%">{value1}</tspan>
        <tspan fontSize="14" x="50%" dy="1.5em">{value2}</tspan>
     </text>
    )
  }

export default function CaloriesGoal(props) {
    const remainingCalories = (props.goal - props.current) < 0 ? 0 : (props.goal - props.current);

    const [data, setData] = useState([
        {name: "Calories", value: props.current, fill: '#8884d8'},
        {name: "Remaining Calories", value: remainingCalories, fill: '#eee'},
    ]);

    useEffect(() => {
        setData([
            {name: "Calories", value: props.current, fill: '#8884d8'},
            {name: "Remaining Calories", value: remainingCalories, fill: '#eee'},  
        ])
    }, [props.current, props.goal]);

    return (
    <React.Fragment>
        <ResponsiveContainer>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name"
                    innerRadius='60%' outerRadius='90%'
                    startAngle={90} endAngle={-270}>
                    <Label width={30} position="center"
                    content={<CustomLabel value1={props.current} value2='calories'/>}>
                        {`${props.current} Calories`}
                    </Label>
                </Pie>
                <Tooltip position={{ x: 0, y: 0 }} />

            </PieChart>
        </ResponsiveContainer>
    </React.Fragment>
    );
}