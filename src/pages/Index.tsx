import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { SearchPage } from "@/components/SearchPage";
import { AdminPage } from "@/components/AdminPage";

type Tab = "search" | "admin";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("search");

  const searchPage = SearchPage();
  const adminPage = AdminPage();

  const getPageData = () => {
    switch (activeTab) {
      case "search":
        return searchPage;
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
