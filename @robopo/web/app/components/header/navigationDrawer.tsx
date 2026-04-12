"use client"

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { NavItem } from "@/app/lib/const"
import {
  COMPETITION_MANAGEMENT_LIST,
  NAVIGATION_GENERAL_LIST,
} from "@/app/lib/const"

function NavLink({
  item,
  active,
  index,
  isOpen,
  onClick,
}: {
  item: NavItem
  active: boolean
  index: number
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-200 ${
        active
          ? "border-primary border-l-4 bg-primary/10 text-primary"
          : "border-transparent border-l-4 text-base-content/70 hover:bg-base-200 hover:text-base-content active:scale-[0.98]"
      }`}
      style={{
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateX(0)" : "translateX(20px)",
        transition: `opacity 300ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 40 + 100}ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 40 + 100}ms`,
      }}
    >
      <span
        className={`flex size-6 shrink-0 items-center justify-center transition-transform duration-200 ${
          active ? "" : "group-hover:scale-110"
        }`}
      >
        {item.icon}
      </span>
      {item.label}
    </Link>
  )
}

export function NavigationDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isOpen, close])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const allItems = [...NAVIGATION_GENERAL_LIST, ...COMPETITION_MANAGEMENT_LIST]
  const dividerIndex = NAVIGATION_GENERAL_LIST.length

  const drawerOverlay = (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        tabIndex={-1}
        aria-label="メニューを閉じる"
      />

      {/* Drawer panel */}
      <nav
        className={`absolute top-0 right-0 h-full w-72 bg-base-100 shadow-2xl ${
          isOpen ? "drawer-slide-in" : "drawer-slide-out"
        }`}
        aria-label="ナビゲーションメニュー"
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-base-300 border-b px-4">
          <span
            className="font-bold text-base text-base-content/80"
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? "translateY(0)" : "translateY(-8px)",
              transition:
                "opacity 250ms cubic-bezier(0.16, 1, 0.3, 1) 80ms, transform 250ms cubic-bezier(0.16, 1, 0.3, 1) 80ms",
            }}
          >
            メニュー
          </span>
          <button
            type="button"
            onClick={close}
            className="btn btn-ghost btn-sm btn-square rounded-full transition-transform duration-200 hover:rotate-90 active:scale-90"
            aria-label="メニューを閉じる"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex flex-col gap-1 p-3">
          {allItems.map((item, i) => (
            <div key={item.href}>
              {i === dividerIndex && (
                <>
                  <div
                    className="my-2 border-base-300 border-t"
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transition: `opacity 300ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 40 + 80}ms`,
                    }}
                  />
                  <span
                    className="mb-1 block px-3 font-semibold text-base-content/40 text-xs uppercase tracking-wider"
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateX(0)" : "translateX(12px)",
                      transition: `opacity 300ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 40 + 80}ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 40 + 80}ms`,
                    }}
                  >
                    大会管理
                  </span>
                </>
              )}
              <NavLink
                item={item}
                active={isActive(item.href)}
                index={i}
                isOpen={isOpen}
                onClick={close}
              />
            </div>
          ))}
        </div>
      </nav>
    </div>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost btn-sm btn-square rounded-full transition-transform duration-200 active:scale-90"
        aria-label="メニューを開く"
      >
        <Bars3Icon className="size-5" />
      </button>

      {mounted && createPortal(drawerOverlay, document.body)}
    </>
  )
}
