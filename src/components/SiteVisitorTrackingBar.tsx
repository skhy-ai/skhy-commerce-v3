import React from 'react';
import VisitorCounterBar from './VisitorCounterBar';
import { useSiteVisitorTracking } from '../hooks/useSiteVisitorTracking';

interface SiteVisitorTrackingBarProps {
    pagePath?: string;
}

const SiteVisitorTrackingBar: React.FC<SiteVisitorTrackingBarProps> = ({ pagePath = '/' }) => {
    const { visitorCounts, totalVisits, isLoading, firstVisitDate } = useSiteVisitorTracking(pagePath);

    return (
        <VisitorCounterBar
            visitorCounts={visitorCounts}
            totalVisits={totalVisits}
            isLoading={isLoading}
            firstVisitDate={firstVisitDate}
        />
    );
};

export default SiteVisitorTrackingBar;
