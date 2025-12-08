'use client';

import { memo, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Bell, Clock, MessageCircle, ShoppingCart, Users, X } from 'lucide-react';

const getKindLabel = (jenisNotif: string) => {
  if (jenisNotif === 'chat') return 'CHAT';
  if (jenisNotif === 'konsumen') return 'KONSUMEN';
  if (jenisNotif === 'claim') return 'CLAIM';
  return 'LAINNYA';
};

interface NotificationData {
  id?: string;
  jenis_notifikasi?: string;
  is_read?: boolean | number | string;
  created_at?: string;
  chatting?: {
    pengirim?: { name?: string };
    pesan?: string;
  };
  konsumen?: {
    created_by?: { name?: string };
    name?: string;
    phone?: string;
  };
  phone?: string;
  user?: { name?: string };
  target?: { hadiah?: string };
  pengirim?: { name?: string };
  type?: string;
}

const getMessage = (n: NotificationData) => {
  if (n.jenis_notifikasi === 'chat') {
    return `${n.chatting?.pengirim?.name ?? 'Pengirim'} mengirim pesan ${n.chatting?.pesan ? `: ${n.chatting.pesan}` : ''}`;
  }
  if (n.jenis_notifikasi === 'konsumen') {
    return `Mitra berusaha menginputkan data Konsumen yang sudah ada milik Sales ${n.konsumen?.created_by?.name ?? '-'} . Konsumen dengan nama ${n.konsumen?.name ?? '-'} dan no. telp ${n.konsumen?.phone ?? n.phone ?? '-'}`;
  }
  if (n.jenis_notifikasi === 'claim') {
    return `${n.user?.name} ingin Claim bonus ${n.target?.hadiah}`;
  }

  return '-';
};

const getTitle = (n: NotificationData) => {
  if (n.jenis_notifikasi === 'chat') return 'Pesan baru';
  if (n.jenis_notifikasi === 'konsumen') return 'Notifikasi Konsumen';
  if (n.jenis_notifikasi === 'claim') return 'Claim Bonus';
  return '-';
};

const NotificationDropdown = memo(function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const notifCount = 0;
  const notifications: NotificationData[] = [];
  const hasUnread = false;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatRelative = (iso: string) => {
    const date = new Date(iso);
    const diffMs = currentTime - date.getTime();
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);
    if (day > 0) return `${day} day${day > 1 ? 's' : ''} ago`;
    if (hour > 0) return `${hour} hour${hour > 1 ? 's' : ''} ago`;
    if (min > 0) return `${min} minute${min > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const renderIcon = (n: NotificationData, index: number) => {
    const kind = (n?.jenis_notifikasi ?? n?.type) as string | undefined;
    const base = 'w-12 h-12 rounded-xl flex items-center justify-center';
    if (kind === 'chat') {
      return (
        <div className={`${base} bg-emerald-700`}>
          <MessageCircle className='h-5 w-5 text-primary-foreground' />
        </div>
      );
    }
    if (kind === 'konsumen') {
      return (
        <div className={`${base} bg-warning`}>
          <Users className='h-5 w-5 text-warning-foreground' />
        </div>
      );
    }
    const bgColors = ['bg-success', 'bg-muted-foreground', 'bg-gray-600'];
    const bgColor = bgColors[index % bgColors.length];
    return (
      <div className={`${base} ${bgColor}`}>
        <ShoppingCart className='h-5 w-5 text-primary-foreground' />
      </div>
    );
  };

  const headerRight = useMemo(
    () => (
      <Button
        variant='ghost'
        className='h-auto p-0 font-normal text-warning hover:bg-warning-light hover:text-warning-text'
        disabled={!hasUnread}>
        Mark All as Read
      </Button>
    ),
    [hasUnread]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button aria-label='Buka notifikasi' className='relative inline-flex h-6 w-6 items-center justify-center'>
          <Bell className='h-6 w-6 cursor-pointer text-muted-foreground' />
          {notifCount > 0 && (
            <span className='font-sf-pro absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-[11px] leading-3 font-bold text-warning-foreground'>
              {notifCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-96 p-0' align='end' sideOffset={8}>
        <div className='flex items-center justify-between border-b p-4'>
          <h3 className='text-lg font-semibold'>Notification</h3>
          <Button variant='ghost' size='icon' className='h-8 w-8' aria-label='Close' onClick={() => setOpen(false)}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='max-h-96 overflow-y-auto'>
          {notifications?.length ? (
            notifications.map((n: NotificationData, index: number) => {
              const kind = getKindLabel(n.jenis_notifikasi ?? '') as string | undefined;
              const isUnread = !n?.is_read || n.is_read === 0 || n.is_read === '0';
              const text = getMessage(n);

              return (
                <div key={n.id} className='border-b p-4 last:border-b-0 hover:bg-muted'>
                  <div className='flex items-start gap-3'>
                    {renderIcon(n, index)}
                    <div className='min-w-0 flex-1'>
                      <p className='mb-2 text-sm text-foreground'>
                        <span className='font-medium'>{getTitle(n)}</span> {text}
                      </p>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Badge variant='secondary' className='bg-info-light text-info-text hover:bg-info-light'>
                          {(kind || '').toString().toUpperCase() || 'TRANSAKSI'}
                        </Badge>
                        <div className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          <span>{formatRelative(n?.created_at ?? new Date().toISOString())}</span>
                        </div>
                      </div>
                    </div>
                    {isUnread && (
                      <div className='shrink-0'>
                        <div className='h-2 w-2 rounded-full bg-destructive'></div>
                        <span className='ml-1 text-lg font-bold text-destructive'>!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className='p-6 text-center text-sm text-muted-foreground'>Tidak ada notifikasi belum dibaca</div>
          )}
        </div>

        <div className='flex items-center justify-between border-t bg-muted p-4'>
          {hasUnread && headerRight}
          <Link
            href='/notifikasi'
            onClick={() => setOpen(false)}
            className='rounded-md bg-success px-4 py-2 text-success-foreground hover:bg-success-dark'>
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default NotificationDropdown;
