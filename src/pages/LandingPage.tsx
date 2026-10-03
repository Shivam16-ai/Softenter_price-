import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnterpriseNav } from '../components/landing/EnterpriseNav';
import { EnterpriseCinematicHero } from '../components/landing/EnterpriseCinematicHero';
import { GlobalNetworkSection } from '../components/landing/GlobalNetworkSection';
import { PhysicalStorySection } from '../components/landing/PhysicalStorySection';
import { TruckJourneySection } from '../components/landing/TruckJourneySection';
import { FleetSection } from '../components/landing/FleetSection';
import { WarehouseOperationsSection } from '../components/landing/WarehouseOperationsSection';
import { TechnologySection } from '../components/landing/TechnologySection';
import { HumanLogisticsSection } from '../components/landing/HumanLogisticsSection';
import { EnterpriseFooter } from '../components/landing/EnterpriseFooter';
import { InvoiceModal } from '../components/common/InvoiceModal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedInvoiceParcelId, setSelectedInvoiceParcelId] = useState<string | null>(null);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#0c0d12] text-white selection:bg-[#FF5500] selection:text-white min-h-screen">
      {/* 1. Transparent-to-Glass Enterprise Top Navigation */}
      <EnterpriseNav
        onSignInClick={() => navigate('/auth')}
        onNavigateSection={scrollToSection}
      />

      {/* 2. Full-Screen Cinematic Real-Video Hero (Purely Cinematic Brand Experience) */}
      <EnterpriseCinematicHero
        onExploreClick={() => scrollToSection('network')}
        onSignInClick={() => navigate('/auth')}
      />

      {/* 3. The Network: "BUILT FOR MOVEMENT AT SCALE" */}
      <GlobalNetworkSection />

      {/* 4. Real-World Physical Story: "FROM WAREHOUSE TO FRONT DOOR" */}
      <PhysicalStorySection />

      {/* 5. Scroll-Driven Truck Journey: "THE INTERSTATE LINEHAUL JOURNEY" */}
      <TruckJourneySection />

      {/* 6. Commercial Fleet Showcase: "THE FLEET BEHIND EVERY DELIVERY" */}
      <FleetSection />

      {/* 7. Warehouse Operations: "EVERY SECOND COUNTS" */}
      <WarehouseOperationsSection />

      {/* 8. Technology: "THE PHYSICAL WORLD. CONNECTED IN REAL TIME." */}
      <TechnologySection />

      {/* 9. The Human Side of Logistics: "TECHNOLOGY MOVES DATA. PEOPLE MOVE THE WORLD." */}
      <HumanLogisticsSection />

      {/* 10. Final Massive CTA & Corporate Directory Footer */}
      <EnterpriseFooter
        onEnterPlatform={() => navigate('/auth')}
        onExploreNetwork={() => scrollToSection('network')}
      />

      {/* Commercial Invoice Modal Integration */}
      {selectedInvoiceParcelId && (
        <InvoiceModal
          parcelId={selectedInvoiceParcelId}
          onClose={() => setSelectedInvoiceParcelId(null)}
        />
      )}
    </div>
  );
};
