import { useEffect } from "react";

const PageWrapper = ({ title, children }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return children;
};

export default PageWrapper;