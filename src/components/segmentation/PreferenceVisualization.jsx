import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { runSpecificSegmentation } from '../services/segmentationApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#FAD000', '#F28E2B'];

const PreferenceVisualization = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segmentData, setSegmentData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await runSpecificSegmentation('preference');
        setSegmentData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching preference segmentation data:', err);
        setError('Failed to load preference segmentation data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform data for pie chart
  const prepareChartData = (distribution) => {
    if (!distribution) return [];
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepare profile data for display
  const prepareProfileData = (profiles) => {
    if (!profiles) return [];
    
    return Object.entries(profiles).map(([group, profile]) => ({
      group,
      ...profile
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const chartData = prepareChartData(segmentData?.distribution);
  const profileData = prepareProfileData(segmentData?.profiles);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Preference-Based Customer Segmentation
      </Typography>
      
      <Typography variant="body1" paragraph>
        {segmentData?.message}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Distribution by Preference Group
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Group Profiles */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preference Group Profiles
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Group</TableCell>
                      <TableCell>Favorite Category</TableCell>
                      <TableCell>Preferred Material</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profileData.map((profile) => (
                      <TableRow key={profile.group}>
                        <TableCell>{profile.group}</TableCell>
                        <TableCell>{profile.favorite_category || 'N/A'}</TableCell>
                        <TableCell>{profile.preferred_material || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Additional Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preference Segmentation Insights
              </Typography>
              <Typography variant="body1" paragraph>
                Preference-based segmentation groups customers based on their product preferences, 
                favorite categories, and preferred materials. This segmentation helps in:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label="Targeted Marketing" color="primary" />
                <Chip label="Product Recommendations" color="secondary" />
                <Chip label="Inventory Planning" color="success" />
                <Chip label="Personalized Promotions" color="info" />
                <Chip label="Product Development" color="warning" />
              </Box>
              <Typography variant="body2">
                Use these insights to tailor your marketing messages, product offerings, and 
                promotions to match customer preferences. Consider creating targeted campaigns 
                for each preference group to maximize engagement and conversion.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PreferenceVisualization;
