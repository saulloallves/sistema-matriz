import { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Breadcrumbs, Link, Alert, Chip } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MapPin, ChevronLeft, AlertCircle } from 'lucide-react';
import { useFranqueadosGeolocationByRegion, type FranqueadoRegionData, type FranqueadoGeolocationData } from '@/hooks/useFranqueadosGeolocation';
import FranqueadosGeolocationDetailModal from '@/components/modals/FranqueadosGeolocationDetailModal';

 type ViewLevel = 'region' | 'state';

 interface ViewState {
   level: ViewLevel;
   selectedRegion: FranqueadoRegionData | null;
 }

 const FranqueadosGeolocationChart = () => {
   const { data, isLoading } = useFranqueadosGeolocationByRegion();
   const [viewState, setViewState] = useState<ViewState>({ level: 'region', selectedRegion: null });
   const [modalOpen, setModalOpen] = useState(false);
   const [selectedEstado, setSelectedEstado] = useState<FranqueadoGeolocationData | null>(null);
   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

   const handleRegionClick = (regionData: FranqueadoRegionData) => {
     setViewState({ level: 'state', selectedRegion: regionData });
   };

   const handleStateClick = (estadoData: FranqueadoGeolocationData) => {
     setSelectedEstado(estadoData);
     setModalOpen(true);
   };

   const handleBack = () => {
     setViewState({ level: 'region', selectedRegion: null });
   };

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
     if (active && payload && payload.length) {
       const payloadData = payload[0];
       const isRegionView = viewState.level === 'region';
       return (
         <Box sx={{ backgroundColor: 'background.paper', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
           <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
             {isRegionView ? payloadData.name : `${payloadData.payload.fullName} (${payloadData.payload.name})`}
           </Typography>
           <Typography variant="body2" sx={{ color: payloadData.fill || payloadData.payload.color, display: 'flex', alignItems: 'center', gap: 1 }}>
             <MapPin size={14} />
             {payloadData.value} {payloadData.value === 1 ? 'franqueado' : 'franqueados'}
             {isRegionView && data && (
               <span style={{ marginLeft: 8, color: '#666' }}>({((payloadData.value / data.stats.franqueadosComLocalizacao) * 100).toFixed(1)}%)</span>
             )}
           </Typography>
           <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
             {isRegionView ? 'Clique para ver estados' : 'Clique para ver cidades'}
           </Typography>
         </Box>
       );
     }
     return null;
   };

   if (isLoading) {
     return (
       <Card sx={{ height: '100%', minHeight: '500px' }}>
         <CardContent sx={{ p: 3, height: '100%' }}>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
             <MapPin size={24} color="#E3A024" />
             <Typography variant="h6">Distribuição Geográfica de Franqueados</Typography>
           </Box>
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 60px)' }}>
             <Typography color="text.secondary">Carregando dados geográficos...</Typography>
           </Box>
         </CardContent>
       </Card>
     );
   }

   if (!data || !data.regioes || data.regioes.length === 0) {
     return (
       <Card sx={{ height: '100%', minHeight: '500px' }}>
         <CardContent sx={{ p: 3, height: '100%' }}>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
             <MapPin size={24} color="#E3A024" />
             <Typography variant="h6">Distribuição Geográfica de Franqueados</Typography>
           </Box>
           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 60px)', gap: 2 }}>
             <MapPin size={48} color="#9e9e9e" />
             <Typography color="text.secondary">Nenhum dado geográfico disponível</Typography>
             <Typography variant="caption" color="text.secondary">Os franqueados precisam ter estado e UF cadastrados</Typography>
           </Box>
         </CardContent>
       </Card>
     );
   }

   const isRegionView = viewState.level === 'region';
   const chartData = isRegionView
     ? data.regioes.map(regiao => ({ name: regiao.regiao, value: regiao.quantidade, color: regiao.cor, data: regiao }))
     : viewState.selectedRegion?.estados.map(estado => ({ name: estado.uf, fullName: estado.estado, value: estado.quantidade, color: viewState.selectedRegion?.cor || '#2196f3', data: estado })) || [];

   return (
     <>
       <Card sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } }}>
         <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
           <Box sx={{ mb: 2 }}>
             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                 <MapPin size={24} color="#E3A024" />
                 <Typography variant="h6">Distribuição Geográfica de Franqueados</Typography>
               </Box>
               {!isRegionView && (
                 <IconButton onClick={handleBack} size="small" color="primary">
                   <ChevronLeft size={20} />
                   <Typography variant="caption" sx={{ ml: 0.5 }}>Voltar</Typography>
                 </IconButton>
               )}
             </Box>
             <Breadcrumbs sx={{ mb: 1 }}>
               <Link component="button" variant="body2" onClick={handleBack} sx={{ cursor: isRegionView ? 'default' : 'pointer', textDecoration: isRegionView ? 'none' : 'underline', color: isRegionView ? 'text.primary' : 'primary.main' }}>Todas as Regiões</Link>
               {!isRegionView && viewState.selectedRegion && (<Typography variant="body2" color="text.primary">{viewState.selectedRegion.regiao}</Typography>)}
             </Breadcrumbs>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
               <Typography variant="body2" color="text.secondary">
                 {data.stats.franqueadosComLocalizacao} franqueados em {isRegionView ? `${data.stats.totalRegioes} ${data.stats.totalRegioes === 1 ? 'região' : 'regiões'}` : `${viewState.selectedRegion?.estados.length} ${viewState.selectedRegion?.estados.length === 1 ? 'estado' : 'estados'}`}
               </Typography>
               {data.stats.franqueadosSemLocalizacao > 0 && (
                 <Chip icon={<AlertCircle size={16} />} label={`${data.stats.franqueadosSemLocalizacao} sem localização`} size="small" color="warning" variant="outlined" />
               )}
             </Box>
             {data.stats.franqueadosSemLocalizacao > 0 && isRegionView && (
               <Alert severity="info" sx={{ mt: 2 }} icon={<AlertCircle size={20} />}>
                 <Typography variant="caption"><strong>{data.stats.franqueadosSemLocalizacao} franqueados</strong> não possuem estado/UF cadastrado e não aparecem no gráfico. Total no sistema: <strong>{data.stats.totalFranqueados} franqueados</strong></Typography>
               </Alert>
             )}
           </Box>
           <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {isRegionView ? (
               <Box sx={{ width: '100%', height: '350px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={chartData} cx="50%" cy="50%" labelLine={true} label outerRadius={100} innerRadius={60} fill="#8884d8" dataKey="value" nameKey="name" cursor="pointer" onClick={(entry) => handleRegionClick(entry.data)} onMouseEnter={(_, index) => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                       {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.6} style={{ transition: 'opacity 0.3s ease', filter: hoveredIndex === index ? 'brightness(1.1)' : 'none' }} />))}
                     </Pie>
                     <Tooltip content={<CustomTooltip />} />
                     <Legend 
                       verticalAlign="bottom" 
                       height={36} 
                       // eslint-disable-next-line @typescript-eslint/no-explicit-any
                       formatter={(value: unknown, entry: any) => `${String(value)}: ${entry?.payload?.value} franqueados`} 
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </Box>
            ) : (
              <Box sx={{ width: '100%', height: '400px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                     <XAxis type="number" />
                     <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} />
                     <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(227, 160, 36, 0.1)' }} />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]} cursor="pointer" onMouseEnter={(_, index) => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                       {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.6} style={{ transition: 'opacity 0.3s ease', filter: hoveredIndex === index ? 'brightness(1.1)' : 'none' }} onClick={() => handleStateClick(entry.data)} />))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </Box>
             )}
           </Box>
           <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
             <Typography variant="caption" color="text.secondary" fontWeight="Bold">
               {isRegionView ? 'Clique em uma região para ver a distribuição por estado' : 'Clique em um estado para ver a distribuição por cidade'}
             </Typography>
           </Box>
         </CardContent>
       </Card>

       <FranqueadosGeolocationDetailModal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedEstado(null); }} estadoData={selectedEstado} />
     </>
   );
 };

 export default FranqueadosGeolocationChart;
