import React from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AppLayout } from "./components/layout/AppLayout";
import HomePage from "./pages/home/index";
import FormulasPage from "./pages/formulas/index";
import ChapterPage from "./pages/chapter/index";
import LessonPage from "./pages/lesson/index";
import NotFoundPage from "./pages/not-found/index";

export function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="formulas" element={<FormulasPage />} />
            <Route path=":chapterId" element={<ChapterPage />} />
            <Route path=":chapterId/:lessonId" element={<LessonPage />} />
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
