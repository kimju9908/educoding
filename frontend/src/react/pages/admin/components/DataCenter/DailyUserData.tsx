import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import {
  ChartsTooltip,
  LinePlot,
  MarkPlot,
  BarPlot,
  ChartsXAxis,
  ResponsiveChartContainer,
} from '@mui/x-charts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import AdminApi from '../../../../../api/AxiosApi/AdminApi/AdminApi';
import { RightChartContainerEach } from '../../../../styles/admin/Admin_DataCenter';

const DailyUserData: React.FC = () => {
  const [data, setData] = useState<{ id: number; date: string; value: number | null }[]>([]);

  const formatDate = (date: string): string => {
    const today = new Date();
    const targetDate = new Date(date);

    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    // if (diffDays === 0) {
    //   return '오늘';
    // } else if (diffDays === 1) {
    //   return '어제';
    // }

    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    return `${month}월 ${day}일`;
  };

  useEffect(() => {
    const getUserIncrementalData = async (): Promise<void> => {
      try {
        const response = await AdminApi.searchUserIncrementalData();

        // Object.entries로 데이터를 변환하고 id 값을 추가, value가 null일 경우 0으로 처리
        const dataRows = Object.entries(response.data).map(([key, value], index) => ({
          id: index + 1, // id는 1부터 시작하도록 설정
          date: formatDate(key),
          value: value === null ? 0 : value, // value가 null이면 0으로 설정
        }));

        setData(dataRows); // 상태에 값 설정
      } catch (error) {
        console.error('불러오는 중 오류 발생 : ', error);
      }
    };

    getUserIncrementalData();
  }, []);
  // const totalData = rows.map((row) => row.total);
  const signupData = data.map((row) => row.value);
  // const changeData = rows.map((row) => row.change);
  const dateData = data.map((row) => row.date);

  const rows = [
    { id: '250312', date: '250312', signup: 5, change: 1, total: 10 },
    { id: '250313', date: '250313', signup: 3, change: 2, total: 12 },
    { id: '250314', date: '250314', signup: 4, change: 3, total: 15 },
    { id: '250315', date: '250315', signup: 3, change: 2, total: 17 },
    { id: '250316', date: '250316', signup: 2, change: 2, total: 19 },
    { id: '250317', date: '250317', signup: 0, change: -2, total: 17 },
    { id: '250318', date: '250318', signup: 3, change: -1, total: 16 },
  ];

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: '날짜',
      type: 'string',
      description: '조회 날짜',
      editable: false,
      sortable: true,
      disableColumnMenu: true,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'value',
      headerName: '신규회원',
      type: 'number',
      description: '해당 일자의 회원가입 회원 수',
      editable: false,
      sortable: true,
      disableColumnMenu: true,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
    },
    // {
    //   field: 'change',
    //   headerName: '전일비교',
    //   type: 'number',
    //   description: '전일과 비교한 전체회원 증감값',
    //   editable: false,
    //   sortable: true,
    //   disableColumnMenu: true,
    //   flex: 1,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
    // {
    //   field: 'total',
    //   headerName: '전체회원',
    //   type: 'number',
    //   description: 'educoding 홈페이지 전체 회원수',
    //   editable: false,
    //   sortable: true,
    //   disableColumnMenu: true,
    //   flex: 1,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
  ];

  return (
    <RightChartContainerEach>
      <Box sx={{ width: '100%' }}>
        <ResponsiveChartContainer
          series={[
            // {
            //   type: 'bar',
            //   label: '전체회원',
            //   data: totalData,
            //   color: 'var(--educoding-hover)',
            //   yAxisId: 'left-y-axis',
            // },
            {
              type: 'line',
              label: '신규회원',
              data: signupData,
              color: 'var(--educoding-purple)',
              yAxisId: 'right-y-axis',
              showMark: false,
            },
            // {
            //   type: 'line',
            //   label: '전일비교',
            //   data: changeData,
            //   color: '#3ce5e5',
            //   yAxisId: 'right-y-axis',
            //   showMark: false,
            // },
          ]}
          xAxis={[
            {
              data: dateData,
              scaleType: 'band',
              id: 'x-axis-id',
            },
          ]}
          yAxis={[
            // {
            //   id: 'left-y-axis',
            //   position: 'left',
            // },
            {
              id: 'right-y-axis',
              position: 'right',
            },
          ]}
          height={300}
        >
          <BarPlot />
          <LinePlot />
          <MarkPlot />
          <ChartsXAxis
            position="bottom"
            axisId="x-axis-id"
            tickLabelStyle={{ fontFamily: 'bold', fontSize: '12px' }}
          />
          <ChartsTooltip trigger="axis" />
        </ResponsiveChartContainer>
      </Box>
      <Box sx={{ height: '61.3%', width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 7,
              },
            },
          }}
          pageSizeOptions={[7]}
          sx={{
            width: '100%',
            fontFamily: 'bold',
            fontSize: '13px',
            border: '1px solid var(--educoding-line)',
            borderRadius: '0',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontFamily: 'extrabold',
            },
            '& .MuiDataGrid-iconButtonContainer': {
              marginLeft: '2px',
              visibility: 'visible !important',
              width: 'auto !important',
            },
            '.MuiDataGrid-sortIcon': {
              opacity: 'inherit !important',
            },
          }}
        />
      </Box>
    </RightChartContainerEach>
  );
};

export default DailyUserData;
