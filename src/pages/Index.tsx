import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { SearchPage } from "@/components/SearchPage";
import { ProjectPage } from "@/components/ProjectPage";
import { AdminPage } from "@/components/AdminPage";

type Tab = "search" | "project" | "admin";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("search");

  const searchPage = SearchPage();
  const projectPage = ProjectPage();
  const adminPage = AdminPage();

  const getPageData = () => {
    switch (activeTab) {
      case "search":
        return searchPage;
      case "project":
        return projectPage;
      case "admin":
        return adminPage;
    }
  };

  const pageData = getPageData();

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebar={pageData.sidebar}
    >
      {pageData.content}
    </AppLayout>
  );
};

export default Index;
