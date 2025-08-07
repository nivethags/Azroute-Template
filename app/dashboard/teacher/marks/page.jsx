"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AddMarksPage() {
  const [marks, setMarks] = useState([{ student: "", score: "" }]);

  const handleChange = (index, field, value) => {
    const newMarks = [...marks];
    newMarks[index][field] = value;
    setMarks(newMarks);
  };

  const handleAddRow = () => {
    setMarks([...marks, { student: "", score: "" }]);
  };

  const handleSave = () => {
    console.log("Marks submitted:", marks);
    alert("Marks saved successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Marks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {marks.map((entry, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Student Name"
                value={entry.student}
                onChange={(e) => handleChange(index, "student", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Marks"
                value={entry.score}
                onChange={(e) => handleChange(index, "score", e.target.value)}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={handleAddRow} variant="outline">
              Add Row
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
