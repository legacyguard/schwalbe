
import {
  Box,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  Divider,
  H1,
  H2,
  H3,
  IconButton,
  Input,
  InputGroup,
  InputHelper,
  InputLabel,
  Paragraph,
  Row,
  Stack,
  TextArea,
} from '../index';

export function TamaguiDemo() {
  return (
    <Container>
      <Stack space='large'>
        {/* Typography Demo */}
        <Stack space='small'>
          <H1 color='primary'>LegacyGuard Design System</H1>
          <Paragraph fontSize="$4" color="$gray10">
            Tamagui-based cross-platform komponenty pre web a mobile
          </Paragraph>
        </Stack>

        <Divider />

        {/* Button Variants */}
        <Stack space='medium'>
          <H2>Buttons</H2>
          <Row space='small' wrap>
            <Button variant='primary'>Primary</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='success'>Success</Button>
            <Button variant='premium'>Premium</Button>
            <Button variant='danger'>Danger</Button>
            <Button variant='ghost'>Ghost</Button>
            <Button variant='outline'>Outline</Button>
          </Row>

          <H3>Button Sizes</H3>
          <Row space='small' align='center'>
            <Button size='small'>Small</Button>
            <Button size='medium'>Medium</Button>
            <Button size='large'>Large</Button>
            <Button size='xlarge'>Extra Large</Button>
          </Row>

          <H3>Icon Buttons</H3>
          <Row space='small'>
            <IconButton size='small' variant='primary'>
              🏠
            </IconButton>
            <IconButton size='medium' variant='success'>
              ✓
            </IconButton>
            <IconButton size='large' variant='premium'>
              ⭐
            </IconButton>
          </Row>
        </Stack>

        <Divider />

        {/* Cards Demo */}
        <Stack space='medium'>
          <H2>Cards</H2>

          <Card variant='default'>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>
                This is a basic card with header and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Paragraph>
                Card content goes here. Cards can contain any content and are
                great for organizing information.
              </Paragraph>
            </CardContent>
            <CardFooter>
              <Button size='small' variant='ghost'>
                Cancel
              </Button>
              <Button size='small'>Save</Button>
            </CardFooter>
          </Card>

          <Card variant='elevated'>
            <CardHeader noBorder>
              <CardTitle>Elevated Card</CardTitle>
            </CardHeader>
            <CardContent>
              <Paragraph>
                This card has enhanced shadow for better depth perception.
              </Paragraph>
            </CardContent>
          </Card>

          <Card variant='premium' padding='large'>
            <CardHeader noBorder>
              <CardTitle>Premium Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <Paragraph>
                Premium cards highlight special features with the gold accent
                color.
              </Paragraph>
            </CardContent>
          </Card>
        </Stack>

        <Divider />

        {/* Input Fields Demo */}
        <Stack space='medium'>
          <H2>Form Elements</H2>

          <InputGroup>
            <InputLabel>Email Address</InputLabel>
            <Input placeholder='Enter your email' variant='default' />
            <InputHelper>We'll never share your email with anyone.</InputHelper>
          </InputGroup>

          <InputGroup>
            <InputLabel>Password</InputLabel>
            <Input
              placeholder='Enter password'
              variant='default'
              secureTextEntry
            />
          </InputGroup>

          <InputGroup>
            <InputLabel>Success State</InputLabel>
            <Input
              placeholder='Valid input'
              variant='success'
              value='valid@example.com'
            />
          </InputGroup>

          <InputGroup>
            <InputLabel>Error State</InputLabel>
            <Input
              placeholder='Invalid input'
              variant='error'
              value='invalid'
            />
          </InputGroup>

          <InputGroup>
            <InputLabel>Message</InputLabel>
            <TextArea
              placeholder='Type your message here...'
              variant='default'
            />
          </InputGroup>
        </Stack>

        <Divider />

        {/* Color Palette */}
        <Stack space='medium'>
          <H2>LegacyGuard Color Palette</H2>

          <Row space='small'>
            <Box
              padding='medium'
              style={{
                backgroundColor: '#1e40af',
                borderRadius: 8,
                width: 100,
                height: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Paragraph style={{ color: 'white' }}>Primary Blue</Paragraph>
            </Box>

            <Box
              padding='medium'
              style={{
                backgroundColor: '#16a34a',
                borderRadius: 8,
                width: 100,
                height: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Paragraph style={{ color: 'white' }}>Success Green</Paragraph>
            </Box>

            <Box
              padding='medium'
              style={{
                backgroundColor: '#f59e0b',
                borderRadius: 8,
                width: 100,
                height: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Paragraph style={{ color: 'white' }}>Premium Gold</Paragraph>
            </Box>
          </Row>
        </Stack>
      </Stack>
    </Container>
  );
}
