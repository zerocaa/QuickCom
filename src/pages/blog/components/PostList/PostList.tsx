import PostItem from '../PostItem'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from 'store'
import { deletePost, startEditingPost, getPostList } from 'pages/blog/blog.slice'
import { Fragment, useEffect, useState } from 'react'
import SkeletonPost from '../SkeletonPost'

export default function PostList() {
  const [count, setCount] = useState(0)

  const postList = useSelector((state: RootState) => state.blog.postList)
  const isLoading = useSelector((state: RootState) => state.blog.loading)
  const dispatch = useAppDispatch()
  const handleDelete = (postId: string) => {
    dispatch(deletePost(postId))
  }
  const handleStartEditing = (postId: string) => {
    dispatch(startEditingPost(postId))
  }
  useEffect(() => {
    const promise = dispatch(getPostList())
    return () => {
      promise.abort()
    }
  }, [dispatch])
  // handleCount
  const handleCount = () => {
    setCount(count + 1)
  }
  return (
    <div className='bg-white py-6 sm:py-8 lg:py-12'>
      <div className='mx-auto max-w-screen-xl px-4 md:px-8'>
        <div className='mb-10 md:mb-16'>
          <div>
            <button onClick={handleCount}>Count</button>
            <p>{count}</p>
          </div>
          <h2 className='mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl'>Được Dev Blog</h2>
          <p className='mx-auto max-w-screen-md text-center text-gray-500 md:text-lg'>
            Đừng bao giờ từ bỏ. Hôm nay khó khăn, ngày mai sẽ trở nên tồi tệ. Nhưng ngày mốt sẽ có nắng
          </p>
        </div>
        <div className='grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-2 xl:gap-8'>
          {isLoading && (
            <Fragment>
              <SkeletonPost />
              <SkeletonPost />
            </Fragment>
          )}
          {!isLoading && postList.length === 0 && <p>Không có bài viết nào</p>}
          {postList.map((post) => (
            <PostItem post={post} key={post.id} handleDelete={handleDelete} handleStartEditing={handleStartEditing} />
          ))}
        </div>
      </div>
    </div>
  )
}
