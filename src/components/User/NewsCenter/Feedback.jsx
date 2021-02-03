import React from 'react';
import FeedbackForm from 'components/User/NewsCenter/FeedbackForm';
import FeedbackHistory from 'components/User/NewsCenter/FeedbackHistory';
import userCSS from 'styles/User/User.less';

const Feedback = () => {
  return (
    <div className={userCSS.content_body}>
      <FeedbackForm />
      <div style={{height: '20px'}} />
      <FeedbackHistory />
    </div>
  );
};

export default Feedback;
