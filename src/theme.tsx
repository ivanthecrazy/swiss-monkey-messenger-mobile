// @ts-nocheck
// Ported verbatim from the platform theme (custom MUI palette/typography augmentation
// keys that we intentionally don't redeclare here). Keep in sync with the platform.
import React from 'react';
import { createTheme } from '@mui/material';
import Box from '@mui/material/Box';

const colorVars = {
  base: 'rgba(5, 10, 15, 1)',
  cyan10: 'rgba(241, 253, 255, 1)',
  cyan100: 'rgba(151, 235, 249, 1)',
  cyan200: 'rgba(107, 219, 238, 1)',
  cyan25: 'rgba(225, 250, 254, 1)',
  cyan300: 'rgba(75, 210, 233, 1)',
  cyan400: 'rgba(43, 193, 219, 1)',
  cyan50: 'rgba(186, 245, 255, 1)',
  cyan500: 'rgba(2, 146, 170, 1)',
  cyan600: 'rgba(6, 108, 125, 1)',
  cyan700: 'rgba(4, 77, 89, 1)',
  cyan800: 'rgba(3, 54, 63, 1)',
  cyan900: 'rgba(2, 42, 49, 1)',
  grey10: 'rgba(253, 253, 254, 1)',
  grey100: 'rgba(188, 188, 197, 1)',
  grey200: 'rgba(136, 136, 140, 1)',

  grey300: 'rgba(102, 102, 110, 1)',
  grey400: 'rgba(69, 69, 75, 1)',
  grey25: 'rgba(235, 235, 241, 1)',
  grey50: 'rgba(216, 216, 223, 1)',
  grey500: 'rgba(55, 55, 60, 1)',
  grey600: 'rgba(36, 36, 39, 1)',
  grey700: 'rgba(29, 29, 31, 1)',
  grey800: 'rgba(23, 23, 24, 1)',
  grey900: 'rgba(18, 17, 21, 1)',
  purple10: 'rgba(255, 252, 255, 1)',
  purple100: 'rgba(254, 233, 252, 1)',
  purple200: 'rgba(251, 219, 248, 1)',
  purple25: 'rgba(232, 229, 255, 1)',
  purple50: 'rgba(199, 194, 255, 1)',
  purple300: 'rgba(116, 51, 255, 1)',
  purple400: 'rgba(94, 0, 255, 1)',
  purple600: 'rgba(58, 0, 153, 1)',
  purple700: 'rgba(33, 0, 102, 1)',
  purple800: 'rgba(69, 11, 68, 1)',
  purple900: 'rgba(56, 18, 56, 1)',
  white: 'rgba(255, 255, 255, 1)',
  dropshadow: 'rgba(14, 20, 32, 0.05)',
  primary: 'rgba(94, 0, 255, 1)',
  attention: 'rgb(139, 0, 0)',
  tertiary: 'rgba(58, 0, 153, 1)',
  secondary: '#f50057',
  quaternary: '#7AB589',
  info: '#FFC107',
  navicon: '#B6A7A1',
  lightblue: '#e4e4fd',
  textWhite: '#ffffff',
  textPrimary: '#45454B',
  textSecondary: '#6C574E',
  hint: '#6C574E',
  darkestPurple: '#01000F',
  success: '#4CAF50',
  danger: '#F44336',
  warning: '#FFa500',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#FFF',
      paper: '#FFF',
    },
    base: {
      main: colorVars.base,
      contrastText: colorVars.base,
    },
    cyan10: {
      main: colorVars.cyan10,
      contrastText: colorVars.cyan10,
    },
    cyan100: {
      main: colorVars.cyan100,
      contrastText: colorVars.cyan100,
    },
    cyan200: {
      main: colorVars.cyan200,
      contrastText: colorVars.cyan200,
    },
    cyan25: {
      main: colorVars.cyan25,
      contrastText: colorVars.cyan25,
    },
    cyan300: {
      main: colorVars.cyan300,
      contrastText: colorVars.cyan300,
    },
    cyan400: {
      main: colorVars.cyan400,
      contrastText: colorVars.cyan400,
    },
    cyan50: {
      main: colorVars.cyan50,
      contrastText: colorVars.cyan50,
    },
    cyan500: {
      main: colorVars.cyan500,
      contrastText: colorVars.cyan500,
    },
    cyan600: {
      main: colorVars.cyan600,
      contrastText: colorVars.cyan600,
    },
    cyan700: {
      main: colorVars.cyan700,
      contrastText: colorVars.cyan700,
    },
    cyan800: {
      main: colorVars.cyan800,
      contrastText: colorVars.cyan800,
    },
    cyan900: {
      main: colorVars.cyan900,
      contrastText: colorVars.cyan900,
    },
    grey10: {
      main: colorVars.grey10,
      contrastText: colorVars.grey10,
    },
    grey100: {
      main: colorVars.grey100,
      contrastText: colorVars.grey100,
    },
    grey200: {
      main: colorVars.grey200,
      contrastText: colorVars.grey200,
    },
    grey25: {
      main: colorVars.grey25,
      contrastText: colorVars.grey25,
    },
    grey300: {
      main: colorVars.grey300,
      contrastText: colorVars.grey300,
    },
    grey400: {
      main: colorVars.grey400,
      contrastText: colorVars.grey400,
    },
    grey50: {
      main: colorVars.grey50,
      contrastText: colorVars.grey50,
    },
    grey500: {
      main: colorVars.grey500,
      contrastText: colorVars.grey500,
    },
    grey600: {
      main: colorVars.grey600,
      contrastText: colorVars.grey600,
    },
    grey700: {
      main: colorVars.grey700,
      contrastText: colorVars.grey700,
    },
    grey800: {
      main: colorVars.grey800,
      contrastText: colorVars.grey800,
    },
    grey900: {
      main: colorVars.grey900,
      contrastText: colorVars.grey900,
    },
    purple10: {
      main: colorVars.purple10,
      contrastText: colorVars.purple10,
    },
    purple100: {
      main: colorVars.purple100,
      contrastText: colorVars.white,
    },
    purple200: {
      main: colorVars.purple200,
      contrastText: colorVars.white,
    },
    purple25: {
      main: colorVars.purple25,
      contrastText: colorVars.white,
    },
    purple300: {
      main: colorVars.purple300,
      contrastText: colorVars.white,
    },
    purple400: {
      main: colorVars.purple400,
      contrastText: colorVars.white,
    },
    purple700: {
      main: colorVars.purple700,
      contrastText: colorVars.white,
    },
    purple800: {
      main: colorVars.purple800,
      contrastText: colorVars.white,
    },
    purple900: {
      main: colorVars.purple900,
      contrastText: colorVars.white,
    },
    white: {
      main: colorVars.white,
      contrastText: colorVars.white,
    },
    purple50: {
      main: colorVars.purple50,
      contrastText: colorVars.white,
    },
    purple600: {
      main: colorVars.purple600,
      contrastText: colorVars.white,
    },
    dropshadow: {
      main: 'rgba(14, 20, 32, 0.05)',
      contrastText: 'rgba(14, 20, 32, 0.05)',
    },
    primary: {
      main: colorVars.primary,
      contrastText: colorVars.white,
    },
    secondary: {
      main: colorVars.secondary,
      contrastText: colorVars.secondary,
    },
    tertiary: {
      main: colorVars.tertiary,
      contrastText: colorVars.tertiary,
    },
    quaternary: {
      main: colorVars.quaternary,
      contrastText: colorVars.quaternary,
    },
    info: {
      main: colorVars.info,
      contrastText: colorVars.info,
    },
    navicon: {
      main: colorVars.navicon,
      contrastText: colorVars.navicon,
    },
    lightblue: {
      main: colorVars.lightblue,
      contrastText: colorVars.lightblue,
    },
    success: {
      main: colorVars.success,
      contrastText: colorVars.white,
    },
    danger: {
      main: colorVars.danger,
      contrastText: colorVars.danger,
    },
    warning: {
      main: colorVars.warning,
      contrastText: colorVars.warning,
    },
    text: {
      white: colorVars.textWhite,
      primary: colorVars.textPrimary,
      secondary: colorVars.textSecondary,
      hint: colorVars.hint,
    },
  },
  typography: {
    fontFamily: "'Lato', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '48px',
      lineHeight: '56px',
      color: '#320F00',
    },
    h3: {
      fontWeight: 700,
      fontSize: '24px',
      lineHeight: '32px',
      color: colorVars.grey800,
    },
    h4: {
      fontWeight: 700,
      fontSize: '20px',
      lineHeight: '27px',
      color: '#320F00',
    },
    black: {
      color: '#171718',
    },
    menuKindTitle: {
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: 'normal',
      color: colorVars.grey100,
      textTransform: 'uppercase',
    },
    reportHead: {
      fontWeight: 600,
      fontSize: '16px',
      color: colorVars.grey800,
    },
    reportHeadValue: {
      marginLeft: '1.8rem',
    },
    reportSectionTitle: {
      fontWeight: 600,
      fontSize: '20px',
      color: colorVars.grey800,
    },
    inputLabel: {
      color: '#45454B',
      fontSize: '14px',
      fontWeight: 400,
      left: 0,
      letterSpacing: '-0.14px',
      lineHeight: 'normal',
      marginBottom: 0.5,
      marginTop: 10,
    },
    inputLabelExplainer: {
      fontFamily: 'Lato',
      color: '#66666E',
      fontSize: '0.875rem',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: 'normal',
      letterSpacing: '-0.00875rem',
      marginBottom: 20,
    },
    customBreadcrumb: {
      cursor: 'pointer',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '21px',
      letterSpacing: '0.1px',
    },
    link: {
      fontWeight: 400,
      cursor: 'pointer',
      textDecoration: 'underline',
      fontSize: '14px',
      lineHeight: '21px',
      color: 'rgba(58, 0, 153, 1)',
      letterSpacing: '0.1px',
    },
    stat: {
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '20px',
      color: '#320F00',
      letterSpacing: '0.15px',
      marginTop: '10px',
      marginBottom: '10px',
    },
    subtitle0: {
      fontWeight: 700,
      fontSize: '24px',
      lineHeight: 'normal',
      letterSpacing: '0',
    },
    subtitle2: {
      fontWeight: 700,
      fontSize: '14px',
      lineHeight: '21px',
      color: '#320F00',
      letterSpacing: '0.1px',
      marginTop: '10px',
      marginBottom: '10px',
    },
    statCardTitle: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '143%',
      letterSpacing: '0.17px',
      color: '#6C574E',
    },
    statCardValue: {
      fontWeight: '400',
      fontSize: '34px',
      lineHeight: '143%',
      letterSpacing: '0.17px',
      color: '#6C574E',
    },
    customTitle: {
      color: '#161618',
      fontFamily: 'Lato',
      fontSize: '32px',
      fontWeight: 500,
      textAlign: 'left',
    },
    customSubtitle: {
      color: '#022a31',
      fontFamily: 'Lato',
      fontSize: '16px',
      fontWeight: 600,
    },
    customHourlyRate: {
      color: '#381238',
      fontFamily: 'Lato',
      fontSize: '16px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    contractorSignupTitleChip: {
      color: '#381238',
      fontFamily: 'Lato',
      fontSize: '1rem',
      fontStyle: 'normal',
      fontWeight: '600',
      lineHeight: 'normal',
    },
    contractorSignupTitle: {
      color: '#381238',
      fontFamily: 'Lato',
      fontSize: '1.5rem',
      fontStyle: 'normal',
      fontWeight: '600',
      lineHeight: 'normal',
    },
    skillMatch: {
      fontFamily: 'Lato',
      fontSize: '12px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    customClientTitle: {
      color: '#161618',
      fontFamily: 'Lato',
      fontSize: '20px',
      fontWeight: 600,
    },
    customClientName: {
      color: '#161618',
      fontFamily: 'Lato',
      fontSize: '16px',
      fontWeight: 600,
      whiteSpace: 'wrap',
    },
    customClientPositionType: {
      color: '#45454b',
      fontFamily: 'Lato, Helvetica',
      fontSize: '14px',
      fontWeight: 400,
      whiteSpace: 'nowrap',
    },
    customClientLocation: {
      color: '#45454b',
      fontFamily: 'Lato, Helvetica',
      fontSize: '14px',
      fontWeight: 400,
      whiteSpace: 'nowrap',
    },
    customDescriptionTitle: {
      color: '#161618',
      fontFamily: 'Lato, Helvetica',
      fontSize: '20px',
      fontWeight: 600,
    },
    customDescriptionText: {
      color: '#45454b',
      fontFamily: 'Lato, Helvetica',
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '22.4px',
    },
    customApplyTitle: {
      color: '#161618',
      fontFamily: 'Lato, Helvetica',
      fontSize: '20px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    customApplyButton: {
      color: '#fffcff',
      fontFamily: 'Lato, Helvetica',
      fontSize: '18px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
    },
    customSavedJobButton: {
      color: '#171718',
      fontFamily: 'Lato, Helvetica',
      fontSize: '18px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
    },
    customSaveJobButton: {
      color: '#171718',
      fontFamily: 'Lato, Helvetica',
      fontSize: '18px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
    },
    customAboutCompanyTitle: {
      color: '#161618',
      fontFamily: 'Lato, Helvetica',
      fontSize: '20px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    customAboutCompanyEmail: {
      color: '#161618',
      fontFamily: 'Lato, Helvetica',
      fontSize: '16px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    noApplicationsTitle: {
      color: '#171718',
      flex: 1,
      fontFamily: 'Lato',
      fontSize: '1.5rem',
      fontWeight: 600,
      textAlign: 'center',
    },
    noApplicationsSubtitle: {
      color: '#66666e',
      fontFamily: 'Lato',
      fontSize: '1rem',
      fontStyle: 'normal',
      fontWeight: 400,
      letterSpacing: '-0.01rem',
      lineHeight: '130%',
      textAlign: 'center',
      width: '315px',
    },
    buttonText: {
      color: '#fffcff',
      fontFamily: 'Lato, Helvetica',
      fontSize: '18px',
      fontWeight: 500,
    },
    jobManagementColumnTitle: {
      color: '#44444a',
      fontFamily: 'Lato, Helvetica',
      fontSize: '12px',
      fontWeight: 500,
      left: 0,
      letterSpacing: '-0.12px',
      lineHeight: '15.6px',
      position: 'fixed',
      top: 0,
      whiteSpace: 'nowrap',
    },
    jobManagementJobTitle: {
      color: colorVars.purple600,
      fontFamily: '"Lato", Helvetica',
      fontSize: '16px',
      fontWeight: 500,
      letterSpacing: '-0.16px',
      lineHeight: '20.8px',
      top: 0,
      width: '238px',
    },
    jobManagementManageJobTitle: {
      color: '#171718',
      fontFamily: '"Lato", Helvetica',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 'normal',
    },
    chatAuthor: {
      color: colorVars.purple600,
      fontFamily: 'Lato',
      fontSize: '1rem',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '1.3rem',
    },
    chatTime: {
      color: '#88888C',
      fontFamily: 'Lato',
      fontSize: '0.75rem',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '1.1rem',
    },
    chatText: {
      color: '#171718',
      fontFamily: 'Lato',
      fontSize: '1rem',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '1.3rem',
      borderLeft: '1px solid #BCBCC5',
      paddingLeft: '12px',
    },
    bodyMediumXs: {
      fontFamily: 'Lato',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 500,
      letterSpacing: '-0.12px',
      lineHeight: '129.99999523162842%',
    },
    bodyMediumSm: {
      fontFamily: 'Lato',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 500,
      letterSpacing: '-0.14px',
      lineHeight: '129.99999523162842%',
    },
    bodyMediumMd: {
      fontFamily: 'Lato',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 500,
      letterSpacing: '-0.16px',
      lineHeight: '129.99999523162842%',
    },
    bodyMediumXl: {
      fontFamily: 'Lato',
      fontSize: '20px',
      fontStyle: 'normal',
      fontWeight: 500,
      letterSpacing: '-0.2px',
      lineHeight: '129.99999523162842%',
    },
    bodyRegularXs: {
      fontFamily: 'Lato',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 400,
      letterSpacing: '-0.12px',
      lineHeight: '129.99999523162842%',
    },
    bodyRegularSm: {
      fontFamily: 'Lato',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      letterSpacing: '-0.14px',
      lineHeight: '129.99999523162842%',
    },
    bodyRegularMd: {
      fontFamily: 'Lato',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      letterSpacing: '-0.16px',
      lineHeight: '129.99999523162842%',
    },
    bodyRegularMd700: {
      fontFamily: 'Lato',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 700,
      letterSpacing: '-0.16px',
      lineHeight: '129.99999523162842%',
    },
    displaySm: {
      fontFamily: 'Lato',
      fontSize: '24px',
      fontStyle: 'normal',
      fontWeight: 600,
      letterSpacing: '-0.48px',
      lineHeight: '100%',
    },
    displayMd: {
      fontFamily: 'Lato',
      fontSize: '32px',
      fontStyle: 'normal',
      fontWeight: 600,
      lineHeight: '100%',
      letterSpacing: '-0.64px',
    },
    formLabel: {
      color: colorVars.grey400,
      fontFamily: 'Lato',
      fontSize: '14px',
      fontWeight: 400,
      left: 0,
      letterSpacing: '-0.14px',
      lineHeight: 'normal',
      position: 'fixed',
      top: 0,
    },
    body1: {
      fontFamily: 'Lato',
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
      letterSpacing: '0.5px',
    },
    input: {
      '& input[type=number]': {
        MozAppearance: 'textfield',
      },
      '& input[type=number]::-webkit-outer-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      '& input[type=number]::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
    },
  },
  components: {
    MuiCheckbox: {
      defaultProps: {
        icon: (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '4px',
              border: '1.25px solid #EBEBF1',
              backgroundColor: '#FDFDFE',
              boxSizing: 'border-box',
            }}
          />
        ),
        checkedIcon: (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '4px',
              backgroundColor: '#5E00FF',
              border: '1.25px solid #5E00FF',
              position: 'relative',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:after': {
                content: '""',
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '5px',
                height: '9px',
                border: '2px solid #FFFFFF',
                borderTop: '0',
                borderLeft: '0',
                transformOrigin: 'center center',
                transform: 'translate(-2.5px, -5.5px) rotate(45deg)',
              },
            }}
          />
        ),
      },
      styleOverrides: {
        root: {
          padding: 0,
          marginLeft: '12px',
          marginRight: '12px',
          '&:hover': { backgroundColor: 'transparent' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: 'none',
          border: '1px solid #EBEBF1',
          '&.PublicProfile-card': {
            marginBottom: '16px',
          },
        },
      },
    },
    MuiStepConnector: {
      root: {
        '&.Mui-active': {
          styleOverrides: {
            alternativeLabel: {
              top: 10,
              left: 'calc(-50% + 16px)',
              right: 'calc(50% + 16px)',
            },
            active: {
              '& .MuiStepConnector-line': {
                borderColor: '#784af4',
              },
            },
            completed: {
              '& .MuiStepConnector-line': {
                borderColor: '#784af4',
              },
            },
            line: {
              borderColor: '#eaeaf0',
              borderTopWidth: 3,
              borderRadius: 1,
            },
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#eaeaf0',
          '&.Mui-active': {
            color: '#784af4',
          },
          '&.Mui-completed': {
            color: '#784af4',
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          '&.actionIcon': {
            cursor: 'pointer',
            '&:hover': {
              color: 'rgba(58, 0, 153, 1)',
            },
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          justifyContent: 'space-between',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#200065',
          color: '#9E9E9E',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '&.Mui-selected': {
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: '#FFF',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          padding: '8px 0px 8px 8px',
          alignItems: 'center',
          '&.Mui-selected': {
            backgroundColor: 'rgba(58, 0, 153, 1)',
            borderRadius: '4px',
            color: '#FFF',
            '&:hover': {
              backgroundColor: 'rgba(58, 0, 153, 1)',
            },
            '.MuiListItemText-secondary': {
              color: '#ddd',
            },
            '.MuiAvatar-root': {
              backgroundColor: 'rgba(108, 0, 203, 1)',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 0,
          marginRight: '8px',
          color: '#9E9E9E',
          '&.Mui-selected': {
            color: '#FFF',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: 600,
          fontSize: '16px',
          lineHeight: '24px',
          letterSpacing: '0.15px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '24px',
          letterSpacing: '0.4px',
          minHeight: '58px',
          paddingBottom: '0px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginTop: '10px',
          marginBottom: '10px',
        },
      },
      variants: [
        {
          props: { variant: 'search' },
          style: {
            width: '100%',
            borderWidth: '1px',
            '& label.Mui-focused': {
              color: '#B6A7A1',
            },
            '& .MuiOutlinedInput-root': {
              '&:active fieldset': {
                borderColor: 'yellow',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#B6A7A1',
                borderWidth: '1px',
              },
            },
          },
        },
        {
          props: { variant: 'standard' }, // Target the multiLineInput variant
          style: {
            // Define your custom styles here
            '& .MuiInputBase-root': {
              border: '1px solid #B6A7A1',
              borderRadius: '8px', // Example: border radius
              '&:before': {
                borderBottom: 'none !important',
              },
              '&:hover:not(.Mui-disabled):before': {
                borderBottom: 'none !important',
              },
              '&:after': {
                borderBottom: 'none !important',
              },
            },
            '& .MuiInputBase-input': {
              padding: '12.5px 16px',
              // height: '44px',
            },
          },
        },
      ],
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginTop: '10px',
          marginBottom: '10px',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          border: '0px',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #B6A7A1',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F4F1EF',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '& input[type=text]': {
            minHeight: '48px',
          },
          '& input[type=email]': {
            minHeight: '48px',
          },
          '& input[type=tel]': {
            minHeight: '48px',
          },
          '& input[type=password]': {
            minHeight: '48px',
          },
          '& input[type=search]': {
            minHeight: '48px',
          },
          '& input[type=file]': {
            minHeight: '48px',
          },
          '& input[type=number]': {
            MozAppearance: 'textfield',
            minHeight: '48px',
          },
          '& input[type=number]::-webkit-outer-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& .MuiAutocomplete-input': {
            padding: '3.5px 4px 7.5px 6px !important',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            padding: '5px',
            height: 'auto',
            minHeight: '40px',
          },
          '.MuiAutocomplete-option:hover': {
            backgroundColor: 'red',
          },
          input: {
            minHeight: '39px !important',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          lineHeight: '1.0375em',
        },
        outlined: {
          '&.Mui-focused': {
            color: '#6C574E',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          // height: '44px',
          '.search': {
            backgroundColor: 'red',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colorVars.primary,
          },
        },
        input: {
          boxSizing: 'border-box',
          // height: '44px',
          padding: '12px 16px',
        },
        select: {
          padding: '10px 10px',
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          '& .MuiToolbar-root': {
            backgroundColor: 'transparent',
            borderBottom: 'none',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: '24px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
        warning: {
          backgroundColor: colorVars.warning,
          color: `${colorVars.warning} !important`,
        },
      },
      variants: [

        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            color: `${colorVars.primary} !important`,
          },
        },
        {
          props: { variant: 'filled', color: 'primary' },
          style: {
            color: `${colorVars.white} !important`,
          },
        },

        {
          props: { variant: 'outlined', color: 'warning' },
          style: {
            color: `${colorVars.warning} !important`,
          },
        },
        {
          props: { variant: 'filled', color: 'warning' },
          style: {
            color: `${colorVars.white} !important`,
          },
        },

        {
          props: { variant: 'outlined', color: 'success' },
          style: {
            color: `${colorVars.success} !important`,
          },
        },
        {
          props: { variant: 'filled', color: 'success' },
          style: {
            color: `${colorVars.white} !important`,
          },
        },

        {
          props: { variant: 'outlined', color: 'danger' },
          style: {
            color: colorVars.danger,
          },
        },
        {
          props: { variant: 'filled', color: 'danger' },
          style: {
            color: colorVars.white,
          },
        },

        {
          props: { variant: 'outlined' },
          style: {
            color: colorVars.grey800,
            borderRadius: '16px',
          },
        },
        {
          props: { variant: 'filled' },
          style: {
            color: colorVars.white,
          },
        },
        {
          props: { variant: 'featureChip' },
          style: {
            display: 'inline-flex',
            padding: '6px 12px 6px 10px',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid',
            fontWeight: 600,
            borderRadius: '16px',
            backgroundColor: '#fff',
            color: '#242427',
            borderColor: '#E8E8EF',
            '& .MuiChip-icon': {
              color: '#DC8CD7', // Override icon color for this specific variant
            },
            '&:hover': {
              borderColor: colorVars.primary,
            },
          },
        },
        {
          props: { variant: 'selectedDay' },
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid',
            fontWeight: 600,
            borderRadius: '50%',
            width: 44,
            height: 44,
            backgroundColor: colorVars.primary,
            color: '#fff',
            borderColor: colorVars.primary,
            '&:hover': {
              backgroundColor: colorVars.primary,
            },
          },
        },
        {
          props: { variant: 'unselectedDay' },
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid',
            fontWeight: 600,
            borderRadius: '50%',
            width: 44,
            height: 44,
            backgroundColor: '#fff',
            color: '#000',
            borderColor: '#ebebf1',
            '&:hover': {
              color: '#fff',
              backgroundColor: colorVars.primary,
            },
          },
        },
        {
          props: { variant: 'selectedJobType' },
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid',
            fontWeight: 600,
            backgroundColor: colorVars.primary,
            color: '#fff',
            borderColor: colorVars.primary,
            paddingLeft: 3,
            paddingRight: 3,
            '&:hover': {
              color: '#fff',
              backgroundColor: colorVars.primary,
            },
          },
        },
        {
          props: { variant: 'unselectedJobType' },
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid',
            fontWeight: 600,
            backgroundColor: '#fff',
            color: '#000',
            borderColor: '#ebebf1',
            paddingLeft: 3,
            paddingRight: 3,
            '&:hover': {
              color: '#fff',
              backgroundColor: colorVars.primary,
            },
          },
        },
        {
          props: { variant: 'selected' },
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid',
            fontWeight: 600,
            backgroundColor: colorVars.primary,
            color: '#fff',
            borderColor: colorVars.primary,
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
            paddingBottom: 5,
            '&:hover': {
              color: '#fff',
              backgroundColor: colorVars.primary,
            },
          },
        },
        {
          props: { variant: 'unselected' },
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid',
            fontWeight: 600,
            backgroundColor: '#fff',
            color: '#000',
            borderColor: '#ebebf1',
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
            paddingBottom: 5,
            '&:hover': {
              color: '#fff',
              backgroundColor: colorVars.primary,
            },
          },
        },
        {
          props: { variant: 'selected-fw' },
          style: {
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid',
            fontWeight: 600,
            backgroundColor: colorVars.primary,
            color: '#fff',
            borderColor: colorVars.primary,
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
            paddingBottom: 5,
            '&:hover': {
              color: '#fff',
              backgroundColor: colorVars.purple600,
            },
          },
        },
        {
          props: { variant: 'unselected-fw' },
          style: {
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid',
            fontWeight: 600,
            backgroundColor: '#fff',
            color: '#000',
            borderColor: '#ebebf1',
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 5,
            paddingBottom: 5,
            '&:hover': {
              color: '#fff',
              backgroundColor: colorVars.primary,
            },
          },
        },
      ],
    },
    MuiBox: {
      styleOverrides: {
        root: {
          '&.jobItem': {
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8ef',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            mb: '16px',
            p: '32px 40px',
            position: 'relative',
          },
          '&.skillTag': {
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBF1',
            borderRadius: '16px',
            padding: '6px 12px',
            gap: 1,
          },
          '&.availabilityDay': {
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBF1',
            borderRadius: 50,
            width: '45px',
            height: '45px',
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
          '&.availabilityDaySelected': {
            backgroundColor: colorVars.primary,
            border: '1px solid #EBEBF1',
            borderRadius: 50,
            width: '45px',
            height: '45px',
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          '&.jobAvatar': {
            border: '1px solid #e8e8ef',
            backgroundColor: 'rgba(58, 0, 153, 1)',
            color: '#fff',
            width: '48px',
            height: '48px',
          },
          '&.PublicProfile-avatar': {
            fontSize: '5rem',
            width: 150,
            height: 150,
            border: '2px solid #7D2A7B',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: '-0.01em',
          '&.officeName': {
            color: '#171718',
            fontFamily: 'Lato, Helvetica',
            fontSize: '16px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          },
          '&.officeName.normalWrap': {
            whiteSpace: 'normal',
          },
          '&.positionType, &.location, &.divider': {
            color: '#88888C',
            fontFamily: 'Lato, Helvetica',
            fontSize: '14px',
            fontWeight: 400,
            whiteSpace: 'nowrap',
          },
          '&.posted, &.title, &.jobType, &.hourlyRate': {
            fontFamily: 'Lato, Helvetica',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          },
          '&.posted': {
            color: '#242427',
            fontSize: '12px',
          },
          '&.title': {
            color: '#171718',
            fontSize: '24px',
          },
          '&.jobType': {
            color: '#022a31',
            fontSize: '16px',
          },
          '&.hourlyRate': {
            color: '#381238',
            fontSize: '16px',
          },
          '&.buttonText': {
            color: '#fffcff',
            fontFamily: 'Lato, Helvetica',
            fontSize: '18px',
            fontWeight: 500,
          },
          '&.PublicProfile-title': {
            marginBottom: '16px',
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 24,
          height: 12,
          padding: 0,
          display: 'flex',
          boxSizing: 'border-box',
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 0,
            top: 0,
            left: 0,
            transitionDuration: '200ms',
            '&.Mui-checked': {
              transform: 'translateX(12px)',
              color: '#FFFFFF',
              '& .MuiSwitch-thumb': {
                backgroundColor: '#FFFFFF',
              },
              '& + .MuiSwitch-track': {
                backgroundColor: colorVars.primary,
                borderColor: colorVars.primary,
                opacity: 1,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 10,
            height: 10,
            boxShadow: 'none',
            backgroundColor: '#BCBCC5',
            margin: '1px',
          },
          '& .MuiSwitch-track': {
            borderRadius: '64px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E3E3EA',
            opacity: 1,
            boxSizing: 'border-box',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minWidth: 'fit-content',
          maxHeight: '48px',
          boxShadow: 'none',
          borderRadius: '64px',
          textTransform: 'none',
          padding: '9px 20px 9px 20px',
          '&.success': {
            color: colorVars.white,
            borderColor: colorVars.success,
            backgroundColor: colorVars.success,
            '&:hover': {
              backgroundColor: colorVars.success,
            },
            '&.Mui-disabled': {
              backgroundColor: colorVars.grey300,
              color: colorVars.grey25,
              borderColor: colorVars.grey25,
            },
          },
          '&.danger': {
            backgroundColor: colorVars.danger,
            color: colorVars.white,
            borderColor: colorVars.danger,
            '&:hover': {
              backgroundColor: colorVars.danger,
            },
            '&.Mui-disabled': {
              backgroundColor: colorVars.grey300,
              color: colorVars.grey25,
              borderColor: colorVars.grey25,
            },
          },
          '&.save': {
            color: '#171718',
            backgroundColor: '#ffffff',
            borderColor: '#e8e8ef',
          },
          '&.gray': {
            color: '#171718',
            backgroundColor: '#ffffff',
            border: '1px solid #EBEBF1',
          },
          '&.gray:hover': {
            color: '#171718',
            backgroundColor: '#f5f5f5',
            border: '1px solid #EBEBF1',
            boxShadow: '0px 0px 10px 4px rgba(0, 0, 0, 0.1)',
          },
          '&.saved': {
            color: '#171718',
            backgroundColor: '#FEEEFC',
            borderColor: '#e8e8ef',
          },
          '&.noFillButton': {
            color: '#171718',
            fontSize: '1.125rem',
            fontWeight: 500,
            backgroundColor: '#fff',
            border: '1px solid #e8e8ef',
            borderColor: '#e8e8ef',
            boxShadow: 'none',
          },
          '&.PublicProfile-button': {
            backgroundColor: colorVars.purple600,
            borderRadius: '32px',
            padding: '9px 24px',
            color: '#FFFCFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          },
          '&.textOnly': {
            textTransform: 'uppercase',
            color: colorVars.purple400,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
          '&.textOnly:hover': {
            color: colorVars.purple600,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
        },
      },
    },
    MuiStack: {
      styleOverrides: {
        root: {
          '&.infoStack': {
            alignItems: 'center',
            flexDirection: 'row',
            gap: '8px',
            backgroundColor: '#f1fdff',
            borderRadius: '16px',
            padding: '6.5px 12px 6.5px 10px',
          },
          '&.eventStack': {
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #ebebf1',
            borderRadius: '16px',
            padding: '6px 12px 6px 10px',
          },
          '&.applicantCard': {
            border: '1px solid #EBEBF1',
            borderRadius: '12px',
            padding: 2,
            gap: 2,
            cursor: 'pointer',
          },
          '&.applicantCardSelected': {
            border: '1px solid #DC8CD7',
            borderRadius: '12px',
            padding: 2,
            gap: 2,
            cursor: 'pointer',
          },
          '&.detailCard': {
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBF1',
            borderRadius: '12px',
            padding: 3,
            gap: 3,
          },
          '&.contentCard': {
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBF1',
            borderRadius: '12px',
            padding: 3,
            gap: 2,
          },
          '&.detailCardHeader': {
            backgroundColor: '#F1FDFE',
            borderRadius: 50,
            padding: '0.5rem 0.5rem 0.2rem 0.5rem',
            gap: 1,
          },
          '&.availabilityTag': {
            backgroundColor: '#F1FDFF',
            borderRadius: '16px',
            padding: '6px 12px',
            gap: 1,
          },
          '&.availabilityTagSelected': {
            backgroundColor: colorVars.purple600,
            borderRadius: '16px',
            padding: '6px 12px',
            gap: 1,
          },
          '&.viewCvButton': {
            backgroundColor: colorVars.purple600,
            paddingLeft: 4,
            paddingRight: 4,
          },
        },
      },
    },
  },
  other: {
    textarea: {
      width: '100%', border: '1px solid rgba(0, 0, 0, 0.32)', borderRadius: 12, padding: 5, marginTop: 1, minHeight: 100,
    },
  },
});

export default theme;
