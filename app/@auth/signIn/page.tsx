"use client"

import { useSearchParams } from "next/navigation"
import { useActionState, useEffect } from "react"
import {
  ModalBackButton,
  ModalBackdrop,
} from "@/app/components/common/commonModal"
import { signInAction } from "@/app/components/server/auth"
import { SIGN_IN_CONST } from "@/app/lib/const"

export default function SignIn() {
  const params = useSearchParams()
  const rawCallbackUrl = params.get("callbackUrl") || "/"
  // クロスサイトスクリプティング&フィッシング攻撃対策
  function getSafeCallbackUrl(cb: string) {
    try {
      const url = new URL(cb, window.location.origin)
      if (
        typeof window !== "undefined" &&
        url.origin === window.location.origin &&
        url.pathname.startsWith("/")
      ) {
        return url.pathname + url.search + url.hash
      }
    } catch {
      return "/"
    }
    return "/"
  }

  const callbackUrl = getSafeCallbackUrl(rawCallbackUrl)
  const [state, action] = useActionState(signInAction, undefined)

  useEffect(() => {
    if (state?.success) {
      window.location.replace(callbackUrl)
    }
  }, [state, callbackUrl])

  return (
    <dialog id="signIn-modal" className="modal modal-open">
      <div className="modal-box">
        <form action={action}>
          <label className="flex" htmlFor="name">
            <span className="label-text">ユーザー名</span>
            <input
              type="text"
              name="username"
              placeholder="ユーザー名"
              className="input input-bordered w-full max-w-xs"
              required={true}
            />
          </label>
          <br />
          <label className="flex" htmlFor="password">
            <span className="label-text">パスワード</span>
            <input
              type="password"
              name="password"
              placeholder="パスワード"
              className="input input-bordered w-full max-w-xs"
              required={true}
            />
          </label>
          <div className="flex flex-row">
            <input
              className="flex btn btn-accent m-3"
              type="submit"
              value={SIGN_IN_CONST.label}
            />
            <ModalBackButton />
            <div className="flex m-3 text-red-500">{state?.message}</div>
          </div>
        </form>
      </div>
      <ModalBackdrop />
    </dialog>
  )
}
