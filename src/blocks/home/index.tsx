'use client';

import * as React from 'react';

import { PageTitle } from '@/components/layouts/page-title';
import { Card, CardContent } from '@/components/ui/card';

const HomePage = React.memo(() => {

  return (
    <div className='min-h-screen space-y-4 bg-muted p-4 md:p-6 lg:p-8'>
      <PageTitle title='Dashboard' />

      <Card className='border-border shadow-sm'>
        <CardContent className='p-6'>
          <h3 className='text-lg font-semibold text-foreground mb-2'>Selamat Datang</h3>
          <p className='text-sm text-muted-foreground'>Sistem Pelaporan Prestasi Mahasiswa</p>
        </CardContent>
      </Card>

    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
