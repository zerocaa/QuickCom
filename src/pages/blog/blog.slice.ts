import { createSlice, PayloadAction, createAsyncThunk, AsyncThunk } from '@reduxjs/toolkit'

import { nanoid } from 'nanoid'

import { Post } from 'types/blog.type'
import http from 'utils/http'

interface BlogState {
  postList: Post[]
  editingPost: Post | null
  loading: boolean
  currentPostId: string | undefined
}
const initialState: BlogState = {
  postList: [],
  editingPost: null,
  loading: false,
  currentPostId: undefined
}

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkAPI) => {
  const response = await http.get<Post[]>('posts', {
    signal: thunkAPI.signal
  })
  return response.data
})
// addPost
export const addPost = createAsyncThunk('blog/addPost', async (post: Post, thunkAPI) => {
  const response = await http.post<Post>('posts', post, {
    signal: thunkAPI.signal
  })
  return response.data
})
// finishEditingPost
export const finishEditingPost = createAsyncThunk('blog/finishEditingPost', async (post: Post, thunkAPI) => {
  const response = await http.put<Post>(`posts/${post.id}`, post, {
    signal: thunkAPI.signal
  })
  return response.data
})
// deletePost
export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkAPI) => {
  await http.delete(`posts/${postId}`, {
    signal: thunkAPI.signal
  })
  return postId
})

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    // when dispath not push id to postList, it will null. should use prepare
    // addPost: (state, action: PayloadAction<Omit<Post, 'id'>>) => {
    //   const post = action.payload
    //   state.postList.push({
    //     ...post,
    //     id: nanoid()
    //   })
    // },
    addPost: {
      reducer: (state, action: PayloadAction<Post>) => {
        const post = action.payload
        state.postList.push(post)
      },
      prepare: (post: Omit<Post, 'id'>) => {
        return {
          payload: {
            ...post,
            id: nanoid()
          }
        }
      }
    },
    deletePost: (state, action) => {
      const postId = action.payload
      const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
      if (foundPostIndex !== -1) {
        state.postList.splice(foundPostIndex, 1)
      }
    },
    startEditingPost: (state, action) => {
      const postId = action.payload
      const foundPost = state.postList.find((post) => post.id === postId) || null
      state.editingPost = foundPost
    },
    cancelEditingPost: (state) => {
      state.editingPost = null
    },
    finishEditingPost: (state, action: PayloadAction<Post>) => {
      const postId = action.payload.id
      state.postList.some((post, index) => {
        if (post.id === postId) {
          state.postList[index] = action.payload
          return true
        }
        return false
      })
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.postList.push(action.payload)
      })
      .addCase(finishEditingPost.fulfilled, (state, action) => {
        const postId = action.payload.id
        state.postList.some((post, index) => {
          if (post.id === postId) {
            state.postList[index] = action.payload
            return true
          }
          return false
        })
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.meta.arg
        const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
        if (foundPostIndex !== -1) {
          state.postList.splice(foundPostIndex, 1)
        }
      })
      .addMatcher<PendingAction>(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          state.loading = true
          state.currentPostId = action.meta.requestId
        }
      )
      .addMatcher<RejectedAction | FulfilledAction>(
        (action) => action.type.endsWith('/rejected') || action.type.endsWith('/fulfilled'),
        (state, action) => {
          if (state.loading && state.currentPostId === action.meta.requestId) {
            state.loading = false
            state.currentPostId = undefined
          }
        }
      )
  }
})
export const { startEditingPost, cancelEditingPost } = blogSlice.actions
export default blogSlice.reducer
