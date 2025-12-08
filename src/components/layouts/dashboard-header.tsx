'use client';

import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { authService, useCurrentUser } from '@/services/auth';
import { useAuth } from '@/contexts/auth-context';

import { useTitleContext } from '../title';
import { SidebarTrigger } from '../ui/sidebar';
import { ChevronDown, LogOut, User } from 'lucide-react';

export function DashboardHeader() {
  const { title } = useTitleContext();
  const { data: currentUser } = useCurrentUser();
  const { user: contextUser, logout } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    window.location.href = '/';
  };

  const userData = currentUser || contextUser;
  const userRole = userData?.role || 'User';

  return (
    <header className='flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6'>
      <div className='flex items-center gap-4'>
        <SidebarTrigger className='h-6 w-6 text-gray-600 hover:text-gray-900' />
        <h1 className='font-sf-pro text-[20px] leading-6 font-semibold tracking-[-0.02em] text-gray-900'>{title}</h1>
      </div>

      <div className='flex items-center gap-6'>
        <DropdownMenu>
          <DropdownMenuTrigger className='flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src='/placeholder-avatar.jpg' alt='User' />
              <AvatarFallback className='font-sf-pro bg-gray-300 text-[14px] leading-5 font-semibold tracking-[-0.01em] text-gray-700'>
                {userData?.full_name ? userData.full_name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='hidden flex-col lg:flex'>
              <span className='font-sf-pro text-[14px] leading-5 font-semibold tracking-[-0.01em] text-gray-900'>
                {userData?.full_name || 'User'}
              </span>
              <span className='font-sf-pro text-left text-[12px] leading-4 font-normal tracking-[-0.01em] text-gray-500'>
                {userRole}
              </span>
            </div>
            <ChevronDown className='hidden h-4 w-4 text-gray-400 lg:block' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm leading-none font-medium'>{userData?.full_name || 'User'}</p>
                <p className='text-muted-foreground text-xs leading-none'>{userData?.email || 'user@example.com'}</p>
                <p className='text-muted-foreground text-xs leading-none'>{userRole}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='cursor-pointer' asChild>
              <Link href='/profile'>
                <User className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='cursor-pointer text-red-600 focus:text-red-600' onClick={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
