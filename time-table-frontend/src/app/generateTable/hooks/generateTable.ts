// // hooks/useInfoGenerate.ts
// import { useQuery } from "@tanstack/react-query";
// import { fetchInfoGenerate, generateEnhancedTimetable } from "../generateTable.service";
// import { EnhancedTimetableData } from "../generateTable.type";
// import { useState, useCallback } from "react";

// export const useInfoGenerate = () => {
//   return useQuery({
//     queryKey: ["infogenerate"],
//     queryFn: fetchInfoGenerate,
//   });
// };

// export const useEnhancedTimetable = () => {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [enhancedData, setEnhancedData] = useState<EnhancedTimetableData | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const generateTimetable = useCallback(async (
//     requestData: any,
//     maxConflicts: number = 10
//   ) => {
//     setIsGenerating(true);
//     setError(null);

//     try {
//       const result = await generateEnhancedTimetable(requestData, maxConflicts);
//       setEnhancedData(result);
//     } catch (err: any) {
//       const errorMessage = err?.response?.data?.message || err?.message || "Failed to generate timetable";
//       setError(errorMessage);
//       console.error("Enhanced timetable generation error:", err);
//     } finally {
//       setIsGenerating(false);
//     }
//   }, []);

//   const reset = useCallback(() => {
//     setEnhancedData(null);
//     setError(null);
//     setIsGenerating(false);
//   }, []);

//   return {
//     generateTimetable,
//     isGenerating,
//     enhancedData,
//     error,
//     reset,
//   };
// };
