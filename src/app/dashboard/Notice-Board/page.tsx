
import React from 'react';
import { default as NoticeBoardHeader } from './NoticeBoardHeader';
import PinnedNotices from './PinnedNotices';
// import AllNotices from './AllNotices';
const NoticeBoardHeaderPage = () => (
	<>
		<NoticeBoardHeader />
		<PinnedNotices />
        {/* <AllNotices /> */}
	</>
);

export default NoticeBoardHeaderPage;
