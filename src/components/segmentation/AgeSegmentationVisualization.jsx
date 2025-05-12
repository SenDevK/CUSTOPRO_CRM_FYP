import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { runSpecificSegmentation } from '../services/segmentationApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#FAD000', '#F28E2B'];

const AgeSegmentationVisualization = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segmentData, setSegmentData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await runSpecificSegmentation('demographic');
        setSegmentData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching demographic segmentation data:', err);
        setError('Failed to load demographic segmentation data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Transform data for charts
  const prepareAgeChartData = (distribution) => {
    if (!distribution) return [];
    
    return Object.entries(distribution)
      .filter(([name]) => name.startsWith('Age_'))
      .map(([name, value]) => ({
        name: name.replace('Age_', ''),
        value
      }))
      .sort((a, b) => {
        // Custom sort order for age groups
        const ageOrder = [
          'Under18', 'YoungAdult', 'Millennial', 'GenX_Young', 
          'GenX_Older', 'BabyBoomer', 'Senior', 'Elderly', 'Unknown'
        ];
        return ageOrder.indexOf(a.name) - ageOrder.indexOf(b.name);
      });
  };

  const prepareGenderChartData = (distribution) => {
    if (!distribution) return [];
    
    return Object.entries(distribution)
      .filter(([name]) => name.startsWith('Gender_'))
      .map(([name, value]) => ({
        name: name.replace('Gender_', ''),
        value
      }));
  };

  const prepareCombinedChartData = (distribution) => {
    if (!distribution) return [];
    
    // Group by age segment
    const ageGroups = {};
    Object.entries(distribution).forEach(([name, value]) => {
      const [gender, age] = name.split('_Age_');
      if (!ageGroups[age]) {
        ageGroups[age] = {};
      }
      ageGroups[age][gender.replace('Gender_', '')] = value;
    });
    
    // Convert to chart format
    return Object.entries(ageGroups).map(([age, genders]) => ({
      name: age,
      ...genders
    }))
    .sort((a, b) => {
      // Custom sort order for age groups
      const ageOrder = [
        'Under18', 'YoungAdult', 'Millennial', 'GenX_Young', 
        'GenX_Older', 'BabyBoomer', 'Senior', 'Elderly', 'Unknown'
      ];
      return ageOrder.indexOf(a.name) - ageOrder.indexOf(b.name);
    });
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

  const ageChartData = prepareAgeChartData(segmentData?.age_distribution);
  const genderChartData = prepareGenderChartData(segmentData?.gender_distribution);
  const combinedChartData = prepareCombinedChartData(segmentData?.distribution);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Demographic Segmentation by Age
      </Typography>
      
      <Typography variant="body1" paragraph>
        {segmentData?.message}
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="demographic segmentation tabs">
          <Tab label="Age Distribution" />
          <Tab label="Gender Distribution" />
          <Tab label="Combined Analysis" />
        </Tabs>
      </Box>
      
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Distribution by Age Group
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ageChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
                      <Legend />
                      <Bar dataKey="value" name="Customers" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Age Group Distribution
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ageChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ageChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Age Group Insights
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Age Segment</TableCell>
                        <TableCell>Age Range</TableCell>
                        <TableCell>Count</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Under18</TableCell>
                        <TableCell>0-17</TableCell>
                        <TableCell>{segmentData?.age_distribution?.Age_Under18 || 0}</TableCell>
                        <TableCell>Minors, typically dependent on parents</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>YoungAdult</TableCell>
                        <TableCell>18-24</TableCell>
                        <TableCell>{segmentData?.age_distribution?.Age_YoungAdult || 0}</TableCell>
                        <TableCell>College-age, early career, trend-focused</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Millennial</TableCell>
                        <TableCell>25-34</TableCell>
                        <TableCell>{segmentData?.age_distribution?.Age_Millennial || 0}</TableCell>
                        <TableCell>Career-building, tech-savvy, experience-oriented</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>GenX_Young</TableCell>
                        <TableCell>35-44</TableCell>
                        <TableCell>{segmentData?.age_distribution?.Age_GenX_Young || 0}</TableCell>
                        <TableCell>Established career, family-focused, practical</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>GenX_Older</TableCell>
                        <TableCell>45-54</TableCell>
                        <TableCell>{segmentData?.age_distribution?.Age_GenX_Older || 0}</TableCell>
                        <TableCell>Peak earning years, value-conscious</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>BabyBoomer</TableCell>
                        <TableCell>55-64</TableCell>
                        <TableCell>{segmentData?.age_distribution?.Age_BabyBoomer || 0}</TableCell>
                        <TableCell>Pre-retirement, brand loyal, quality-focused</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Senior</TableCell>
                        <TableCell>65-74</TableCell>
                        <TableCell>{segmentData?.age_distribution?.Age_Senior || 0}</TableCell>
                        <TableCell>Retirement age, health-conscious, traditional</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Elderly</TableCell>
                        <TableCell>75+</TableCell>
                        <TableCell>{segmentData?.age_distribution?.Age_Elderly || 0}</TableCell>
                        <TableCell>Seniors, often value simplicity and reliability</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Distribution by Gender
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={genderChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
                      <Legend />
                      <Bar dataKey="value" name="Customers" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Gender Distribution
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderChartData.map((entry, index) => (
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
        </Grid>
      )}
      
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Age and Gender Distribution
                </Typography>
                <Box sx={{ height: 500 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={combinedChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Male" stackId="a" fill="#8884d8" />
                      <Bar dataKey="Female" stackId="a" fill="#82ca9d" />
                      <Bar dataKey="Other" stackId="a" fill="#ffc658" />
                      <Bar dataKey="Unknown" stackId="a" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Marketing Insights by Age Group
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Age Segment</TableCell>
                        <TableCell>Marketing Approach</TableCell>
                        <TableCell>Channel Preferences</TableCell>
                        <TableCell>Product Focus</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Under18</TableCell>
                        <TableCell>Trendy, social media-focused</TableCell>
                        <TableCell>TikTok, Instagram, YouTube</TableCell>
                        <TableCell>Fashion, entertainment, technology</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>YoungAdult</TableCell>
                        <TableCell>Experience-oriented, authentic</TableCell>
                        <TableCell>Instagram, Twitter, Snapchat</TableCell>
                        <TableCell>Affordable luxury, experiences, education</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Millennial</TableCell>
                        <TableCell>Value-driven, socially conscious</TableCell>
                        <TableCell>Instagram, Facebook, Email</TableCell>
                        <TableCell>Home goods, sustainable products, travel</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>GenX_Young</TableCell>
                        <TableCell>Family-oriented, practical</TableCell>
                        <TableCell>Facebook, Email, SMS</TableCell>
                        <TableCell>Family products, financial services, home improvement</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>GenX_Older</TableCell>
                        <TableCell>Quality-focused, value-conscious</TableCell>
                        <TableCell>Email, Facebook, LinkedIn</TableCell>
                        <TableCell>Premium products, health, investment</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>BabyBoomer</TableCell>
                        <TableCell>Brand loyal, traditional</TableCell>
                        <TableCell>Email, Facebook, Traditional media</TableCell>
                        <TableCell>Health, travel, luxury goods</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Senior</TableCell>
                        <TableCell>Relationship-based, service-oriented</TableCell>
                        <TableCell>Email, Phone, Traditional media</TableCell>
                        <TableCell>Health, leisure, comfort products</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Elderly</TableCell>
                        <TableCell>Simplicity, reliability, trust</TableCell>
                        <TableCell>Phone, Print, Television</TableCell>
                        <TableCell>Health, convenience, traditional services</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AgeSegmentationVisualization;
