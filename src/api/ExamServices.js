import api from "./api";

export const getInstructorCoursesForExams = async () => {
  const { data } = await api.get("/instructor-profile/courses-list");
  return data?.data || [];
};

export const getExamsInstructor = async (filters = {}) => {
  const { data } = await api.get("/instructor-profile/exams", {
    params: filters,
  });
  return data?.data || [];
};

export const getExamDetailsInstructor = async (id) => {
  const { data } = await api.get(`/instructor-profile/exams/${id}`);
  return data?.data || null;
};

export const addExam = async (formData, id) => {
  const { data } = await api.post(
    `/instructor-profile/courses/${id}/exams`,
    formData,
  );
  return data?.data || null;
};

export const updateExam = async (formData, id) => {
  const { data } = await api.post(`/instructor-profile/exams/${id}`, formData);
  return data?.data || null;
};

export const deleteExam = async (id) => {
  const { data } = await api.delete(`/instructor-profile/exams/${id}`);
  return data?.data || null;
};

export const getInstructorWallet = async () => {
  const { data } = await api.get("/instructor-profile/wallet");
  return data?.data || [];
};

// student
export const getExamsStudent = async (filters = {}) => {
  const { data } = await api.get("/student-profile/exams", {
    params: filters,
  });
  return data?.data || [];
};

export const getExamsStudentQuestion = async (id) => {
  const { data } = await api.get(`/student-profile/exams/${id}`);
  return data?.data || [];
};

export const submitAnswer = async (formData, id) => {
  const { data } = await api.post(
    `/student-profile/exams/${id}/submit`,
    formData,
  );
  return data?.data || null;
};

export const getExamsResult = async (id) => {
  const { data } = await api.get(`/student-profile/exams/${id}/result`);
  return data?.data || [];
};

export const getExamsTemplate = async () => {
  const { data } = await api.get(`/instructor-profile/exams/template`, {
    responseType: "blob",
  });

  return data;
};

export const uploadExamFile = async ({ formData, courseId }) => {
  const { data } = await api.post(
    `/instructor-profile/courses/${courseId}/exams/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
};

export const getExamsCourses = async () => {
  const { data } = await api.get("/student-profile/exams/courses");
  return data?.data || [];
};
