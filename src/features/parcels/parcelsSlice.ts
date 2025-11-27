// src/features/parcels/parcelsSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Parcel {
  _id: string;
  trackingId: string;
  senderName: string;
  receiverName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ParcelsState {
  selectedParcel: Parcel | null;
  filterStatus: string;
  isDetailsModalOpen: boolean;
}

const initialState: ParcelsState = {
  selectedParcel: null,
  filterStatus: "all",
  isDetailsModalOpen: false,
};

const parcelsSlice = createSlice({
  name: "parcels",
  initialState,
  reducers: {
    setSelectedParcel(state, action: PayloadAction<Parcel | null>) {
      state.selectedParcel = action.payload;
    },
    setFilterStatus(state, action: PayloadAction<string>) {
      state.filterStatus = action.payload;
    },
    openDetailsModal(state) {
      state.isDetailsModalOpen = true;
    },
    closeDetailsModal(state) {
      state.isDetailsModalOpen = false;
    },
  },
});

export const {
  setSelectedParcel,
  setFilterStatus,
  openDetailsModal,
  closeDetailsModal,
} = parcelsSlice.actions;

export default parcelsSlice.reducer;
