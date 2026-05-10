// src/services/api.js — All API calls to the FastAPI backend

import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000" });

// Send a chat message
export const sendMessage = (message, sessionId = "default") =>
  API.post("/chat", { message, session_id: sessionId });

// Search universities
export const searchUniversities = (q = "", skip = 0, limit = 20) =>
  API.get("/universities", { params: { q, skip, limit } });

// Get one university
export const getUniversity = (id) =>
  API.get(`/universities/${id}`);

// Get career recommendations
export const getRecommendations = (field, location = "", budget = "") =>
  API.post("/careers/recommend", { field, location, budget });

// Get career roadmap
export const getRoadmap = (field) =>
  API.get(`/careers/roadmap/${field}`);

// Search scholarships
export const searchScholarships = (q = "") =>
  API.get("/scholarships", { params: { q } });

// Analyze CV against Job Description
export const analyzeCV = (file, jobDescription) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);
  return API.post("/cv-analyzer/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Generate Cover Letter
export const generateCoverLetter = (file, jobDescription) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);
  return API.post("/cv-analyzer/cover-letter", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Generate Interview Questions
export const getInterviewPrep = (file, jobDescription) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);
  return API.post("/cv-analyzer/interview-prep", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Evaluate Interview Answer
export const evaluateInterviewAnswer = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => formData.append(key, data[key]));
  return API.post("/cv-analyzer/evaluate-answer", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Bulk Analyze CVs
export const bulkAnalyzeCVs = (files, jobDescription) => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  formData.append("job_description", jobDescription);
  return API.post("/cv-analyzer/bulk-analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
