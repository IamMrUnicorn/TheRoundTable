import React from 'react';
import GuideSidebar from '../Components/GuidePageComponents/GuideSideBar';
import GuideContent from '../Components/GuidePageComponents/GuideContent';

const GuidePage = () => {
  return (
    <div className="flex flex-row">
      <GuideSidebar />
      <GuideContent />
    </div>
  );
};

export default GuidePage;