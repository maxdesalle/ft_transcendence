import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { routes, urls } from '../../api/utils';
import { Message } from '../../types/chat.interface';
import { api } from '../../utils/api';
type Status = 'idle' | 'loading' | 'success' | 'failed';

interface ChatState {
  messages: Message[];
  status: Status;
}

const initialState: ChatState = {
  messages: [],
  status: 'idle',
};

export const fetchMessages = createAsyncThunk(
  'chat/messages',
  async (id: number) => {
    const res = await api.get<Message[]>(`${routes.roomMessages}/${id}`);
    return res.data;
  },
);

export const fetchFriendMessage = createAsyncThunk(
  'chat/friend_messages',
  async (id: number) => {
    const res = await api.get<Message[]>(`${routes.chat}/dm/${id}`);
    return res.data;
  },
);

const chatSlice = createSlice({
  name: 'Chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages = [...state.messages, action.payload];
    },
    resetMessages: (state) => {
      state.messages = [];
      state.status = 'idle';
    },
    addFriendMessage: (state, action: PayloadAction<Message>) => {
      state.messages = [...state.messages, action.payload];
    },
    changeStatus: (state, action: PayloadAction<Status>) => {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.status = 'success';
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(fetchFriendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFriendMessage.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.status = 'success';
      })
      .addCase(fetchFriendMessage.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { addMessage, resetMessages, addFriendMessage, changeStatus } =
  chatSlice.actions;
export default chatSlice.reducer;
