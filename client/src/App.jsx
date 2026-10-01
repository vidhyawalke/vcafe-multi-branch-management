import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import DashboardTab from './components/DashboardTab';
import PosTab from './components/PosTab';
import InventoryTab from './components/InventoryTab';
import BranchesTab from './components/BranchesTab';
import ReceiptModal from './components/ReceiptModal';
import RestockModal from './components/RestockModal';
import TransferModal from './components/TransferModal';
import LoginModal from './components/LoginModal';
import { api, setAuthSession, getStoredUser } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [receiptData, setReceiptData] = useState(null);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [allInventory, setAllInventory] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const existing = getStoredUser();
    if (existing) {
      setCurrentUser(existing);
    } else {
      handleSwitchPersona('owner');
    }
    loadMasterInventory();
  }, []);

  async function loadMasterInventory() {
    try {
      const res = await api.inventory.getInventory();
      setAllInventory(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSwitchPersona(personaId) {
    try {
      const res = await api.auth.demoLogin(personaId);
      if (res.success) {
        setAuthSession(res.data.token, res.data.user);
        setCurrentUser(res.data.user);
        showToast(res.message);

        if (res.data.user.role === 'staff' && (activeTab === 'dashboard' || activeTab === 'branches')) {
          setActiveTab('pos');
        }
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  }

  function handleLogout() {
    setAuthSession(null, null);
    setCurrentUser(null);
    showToast('Signed out of VCafe.');
  }

  function handleOrderComplete(newOrder) {
    setReceiptData(newOrder);
    loadMasterInventory();
    showToast(`Order #${newOrder.orderNumber} billed successfully!`);
  }

  function handleOpenRestock(item) {
    setSelectedRestockItem(item || null);
    setRestockModalOpen(true);
  }

  function handleOpenTransfer() {
    setTransferModalOpen(true);
  }

  const tabTitles = {
    pos: { title: 'Point of Sale & Orders', subtitle: 'Live customer checkout and recipe-driven inventory deduction' },
    dashboard: { title: 'Sales Analytics & Reports', subtitle: 'Branch revenue performance, daily trend lines, and order statistics' },
    inventory: { title: 'Raw Material Inventory', subtitle: 'Real-time ingredient levels, low-stock triggers, and inter-branch transfers' },
    branches: { title: 'Goa Outlets & Team', subtitle: 'Multi-branch locations and staff role-based access control (RBAC)' }
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar (GoMeal style) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <TopHeader
          title={tabTitles[activeTab]?.title}
          subtitle={tabTitles[activeTab]?.subtitle}
          currentUser={currentUser}
          onSwitchPersona={handleSwitchPersona}
        />

        <div className="content-body">
          {activeTab === 'pos' && (
            <PosTab currentUser={currentUser} onOrderComplete={handleOrderComplete} />
          )}

          {activeTab === 'dashboard' && (
            <DashboardTab currentUser={currentUser} onViewReceipt={(order) => setReceiptData(order)} />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              currentUser={currentUser}
              onOpenRestock={handleOpenRestock}
              onOpenTransfer={handleOpenTransfer}
            />
          )}

          {activeTab === 'branches' && <BranchesTab currentUser={currentUser} />}
        </div>
      </div>

      {/* Modals */}
      <ReceiptModal receiptData={receiptData} onClose={() => setReceiptData(null)} />

      <RestockModal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        selectedItem={selectedRestockItem}
        allInventory={allInventory}
        onSuccess={() => {
          loadMasterInventory();
          showToast('Stock inventory updated successfully!');
        }}
      />

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        allInventory={allInventory}
        onSuccess={() => {
          loadMasterInventory();
          showToast('Inter-branch stock transfer completed!');
        }}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }}
      />

      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-modal)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
            zIndex: 100
          }}
        >
          <span>☕</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
