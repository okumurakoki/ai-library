import { SignUp } from '@clerk/clerk-react';
import { Box, Container } from '@mui/material';

const SignUpPage = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-none border border-gray-200',
            },
          }}
          signInUrl="/sign-in"
          forceRedirectUrl="/"
          fallbackRedirectUrl="/"
        />
      </Box>
    </Container>
  );
};

export default SignUpPage;
