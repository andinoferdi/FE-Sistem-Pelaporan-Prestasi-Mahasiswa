'use client';

import * as React from 'react';

import { PageTitle } from '@/components/page-title';
import { Card, CardContent } from '@/components/ui/card';

const HomePage = React.memo(() => {

  return (
    <div className='min-h-screen space-y-4 bg-gray-50 p-4 md:p-6 lg:p-8'>
      <PageTitle title='Dashboard' />

      <Card className='border-gray-200 shadow-sm'>
        <CardContent className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>Selamat Datang</h3>
          <p className='text-sm text-gray-600'>Sistem Pelaporan Prestasi Mahasiswa</p>
        </CardContent>
      </Card>

    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
