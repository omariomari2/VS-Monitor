import React, { useState } from 'react';
import { Header } from './components/Header';
import { Controls, KPIHeader } from './components/Controls';
import { UserGrowthChart } from './components/charts/UserGrowthChart';
import { DeviceTrafficChart } from './components/charts/DeviceTrafficChart';
import { IncomeChart } from './components/charts/IncomeChart';
import { TabOption } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.Users);

  return (
    <div className="min-h-screen bg-bgPrimary pb-12 font-sans selection:bg-green-200">
      <div className="max-w-[1280px] mx-auto pt-6 px-4 sm:px-8">
        {/* Main Content Card Wrapper */}
        <div className="bg-bgPrimary rounded-none sm:rounded-3xl overflow-hidden">
          <Header />
          
          <main className="mt-8 px-2 sm:px-4">
            <Controls activeTab={activeTab} onTabChange={setActiveTab} />
            
            <KPIHeader />
            
            {/* Top Chart Section */}
            <section className="mb-6">
              <UserGrowthChart />
            </section>
            
            {/* Bottom Grid Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DeviceTrafficChart />
              <IncomeChart />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}