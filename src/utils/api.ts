export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API call failed");
  }

  return response.json();
}

export function getAuthHeaders(extraHeaders: HeadersInit = {}): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extraHeaders,
  };
}

export async function getCourses() {
  return apiCall("/api/courses");
}

export async function createCourse(courseData: any) {
  return apiCall("/api/courses", {
    method: "POST",
    body: JSON.stringify(courseData),
  });
}

export async function updateCourse(id: string, courseData: any) {
  return apiCall("/api/courses", {
    method: "PUT",
    body: JSON.stringify({ id, ...courseData }),
  });
}

export async function deleteCourse(id: string) {
  return apiCall("/api/courses", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

export async function enrollCourse(id: string) {
  return apiCall("/api/courses", {
    method: "PATCH",
    body: JSON.stringify({ id, action: "enroll" }),
  });
}

export async function getVideos(course?: string) {
  const url = course ? `/api/content/videos?course=${course}` : "/api/content/videos";
  return apiCall(url);
}

export async function createVideo(videoData: any) {
  return apiCall("/api/content/videos", {
    method: "POST",
    body: JSON.stringify(videoData),
  });
}

export async function updateVideo(id: string, videoData: any) {
  return apiCall("/api/content/videos", {
    method: "PUT",
    body: JSON.stringify({ id, ...videoData }),
  });
}

export async function deleteVideo(id: string) {
  return apiCall("/api/content/videos", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

export async function getRecordings(course?: string) {
  const url = course ? `/api/content/recordings?course=${course}` : "/api/content/recordings";
  return apiCall(url);
}

export async function createRecording(recordingData: any) {
  return apiCall("/api/content/recordings", {
    method: "POST",
    body: JSON.stringify(recordingData),
  });
}

export async function updateRecording(id: string, recordingData: any) {
  return apiCall("/api/content/recordings", {
    method: "PUT",
    body: JSON.stringify({ id, ...recordingData }),
  });
}

export async function deleteRecording(id: string) {
  return apiCall("/api/content/recordings", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

export async function getNotes(course?: string) {
  const url = course ? `/api/content/notes?course=${course}` : "/api/content/notes";
  return apiCall(url);
}

export async function createNote(noteData: any) {
  return apiCall("/api/content/notes", {
    method: "POST",
    body: JSON.stringify(noteData),
  });
}

export async function updateNote(id: string, noteData: any) {
  return apiCall("/api/content/notes", {
    method: "PUT",
    body: JSON.stringify({ id, ...noteData }),
  });
}

export async function deleteNote(id: string) {
  return apiCall("/api/content/notes", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

export async function getDiscussions(course?: string) {
  const url = course ? `/api/content/discussions?course=${course}` : "/api/content/discussions";
  return apiCall(url);
}

export async function createDiscussion(discussionData: any) {
  return apiCall("/api/content/discussions", {
    method: "POST",
    body: JSON.stringify(discussionData),
  });
}

export async function updateDiscussion(id: string, discussionData: any) {
  return apiCall("/api/content/discussions", {
    method: "PUT",
    body: JSON.stringify({ id, ...discussionData }),
  });
}

export async function deleteDiscussion(id: string) {
  return apiCall("/api/content/discussions", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}
