import React, { useCallback } from 'react'

type Props = {
  isLoading: boolean | (() => boolean),
  children: React.ReactNode | (() => React.ReactNode)
}

const LoadingWrapper = ({ isLoading, children }: Props) => {
  const condition = typeof isLoading === 'function' ? isLoading() : !!isLoading

  const renderChild = useCallback(() => {
    return typeof children === 'function' ? children() : children
  }, [children])

  return <>{condition ? <h2>Loading</h2> : renderChild()}</>
}

export default React.memo(LoadingWrapper)
