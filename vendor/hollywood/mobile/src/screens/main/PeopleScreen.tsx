import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  H2,
  H3,
  IconButton,
  Input,
  Paragraph,
  RadioGroup,
  Row,
  ScrollContainer,
  Stack,
  // CheckboxGroup,
  // Switch,
  useMedia,
  useTheme,
} from '@legacyguard/ui';
import {
  AlertCircle,
  Briefcase,
  Edit2,
  Heart,
  Mail,
  Phone,
  Search,
  Shield,
  Trash2,
  User,
  UserPlus,
} from 'lucide-react-native';
import { Alert, RefreshControl } from 'react-native';
// import { useNavigation } from '@react-navigation/native' // Uncomment when navigation is implemented

// Person types and roles
export interface PersonRole {
  color: string;
  icon: any;
  id: string;
  label: string;
}

const PERSON_ROLES: PersonRole[] = [
  { id: 'guardian', label: 'Guardian', icon: Shield, color: '$primaryBlue' },
  {
    id: 'beneficiary',
    label: 'Beneficiary',
    icon: Heart,
    color: '$primaryGreen',
  },
  { id: 'executor', label: 'Executor', icon: Briefcase, color: '$accentGold' },
];

interface Person {
  addedAt: Date;
  email?: string;
  id: string;
  isEmergencyContact?: boolean;
  name: string;
  notes?: string;
  phone?: string;
  relationship: string;
  roles: string[];
}

export const PeopleScreen = () => {
  // const navigation = useNavigation() // Uncomment when navigation is implemented
  const theme = useTheme();
  const media = useMedia();

  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Modal states - uncomment when modal implementation is added
  // const [showAddModal, setShowAddModal] = useState(false)
  // const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  const loadPeople = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // TODO: Load from API/Supabase
      // For now, using mock data
      const mockPeople: Person[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+421 900 123 456',
          relationship: 'Brother',
          roles: ['guardian', 'executor'],
          isEmergencyContact: true,
          notes: 'Primary contact for emergencies',
          addedAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          relationship: 'Spouse',
          roles: ['beneficiary', 'guardian'],
          addedAt: new Date('2024-02-20'),
        },
        {
          id: '3',
          name: 'Michael Johnson',
          phone: '+421 900 789 012',
          relationship: 'Friend',
          roles: ['executor'],
          notes: 'Lawyer and trusted friend',
          addedAt: new Date('2024-03-10'),
        },
      ];

      setPeople(mockPeople);
    } catch (error) {
      console.error('Failed to load people:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const filterPeople = useCallback(() => {
    let filtered = [...people];

    // Apply role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(person => person.roles.includes(selectedRole));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        person =>
          person.name.toLowerCase().includes(query) ||
          person.email?.toLowerCase().includes(query) ||
          person.relationship.toLowerCase().includes(query)
      );
    }

    setFilteredPeople(filtered);
  }, [people, selectedRole, searchQuery]);

  // Load people on mount
  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  // Filter people when search or role changes
  useEffect(() => {
    filterPeople();
  }, [filterPeople]);

  const getRoleIcon = (roleId: string) => {
    const role = PERSON_ROLES.find(r => r.id === roleId);
    return role?.icon || User;
  };

  // const getRoleColor = (roleId: string) => {
  //   const role = PERSON_ROLES.find(r => r.id === roleId)
  //   return role?.color || '$gray6'
  // }

  const handleAddPerson = () => {
    // TODO: Navigate to add person screen or show modal
    // navigation.navigate('AddPerson')
    // setShowAddModal(true)
    console.log('Add person clicked'); // Temporary placeholder
  };

  const handleEditPerson = (person: Person) => {
    // TODO: Navigate to edit screen or show modal
    // setEditingPerson(person)
    // navigation.navigate('EditPerson', { personId: person.id })
    console.log('Edit person:', person.id); // Temporary placeholder
  };

  const handleDeletePerson = (person: Person) => {
    Alert.alert(
      'Remove Person',
      `Are you sure you want to remove ${person.name} from your trusted circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPeople(prev => prev.filter(p => p.id !== person.id));
          },
        },
      ]
    );
  };

  const handleContactPerson = (person: Person, method: 'email' | 'phone') => {
    if (method === 'email' && person.email) {
      // TODO: Open email client
      console.log('Email:', person.email);
    } else if (method === 'phone' && person.phone) {
      // TODO: Open phone dialer
      console.log('Call:', person.phone);
    }
  };

  const renderPersonCard = (person: Person) => {
    return (
      <Card
        key={person.id}
        animation='medium'
        pressStyle={{ scale: 0.98 }}
        onPress={() => handleEditPerson(person)}
        marginBottom='$3'
      >
        <CardContent>
          <Stack gap='$3'>
            {/* Header Row */}
            <Row align='center' justify='between'>
              <Row align='center' space='small' flex={1}>
                <Stack
                  width={48}
                  height={48}
                  borderRadius={24}
                  backgroundColor='$gray2'
                  alignItems='center'
                  justifyContent='center'
                >
                  <User size={24} color={theme.gray6.val} />
                </Stack>

                <Stack flex={1}>
                  <Row align='center' space='xs'>
                    <Paragraph fontWeight='600' fontSize='$5'>
                      {person.name}
                    </Paragraph>
                    {person.isEmergencyContact && (
                      <AlertCircle size={16} color={theme.error.val} />
                    )}
                  </Row>
                  <Paragraph size='small' color='muted'>
                    {person.relationship}
                  </Paragraph>
                </Stack>
              </Row>

              <Row space='xs'>
                <IconButton
                  size='small'
                  variant='ghost'
                  onPress={() => handleEditPerson(person)}
                >
                  <Edit2 size={16} />
                </IconButton>
                <IconButton
                  size='small'
                  variant='ghost'
                  onPress={() => handleDeletePerson(person)}
                >
                  <Trash2 size={16} color={theme.error.val} />
                </IconButton>
              </Row>
            </Row>

            {/* Roles */}
            <Row space='xs' flexWrap='wrap'>
              {person.roles.map(roleId => {
                const role = PERSON_ROLES.find(r => r.id === roleId);
                const Icon = getRoleIcon(roleId);
                return (
                  <Row
                    key={roleId}
                    space='xs'
                    align='center'
                    style={{
                      backgroundColor: '#f3f4f6',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Icon
                      size={14}
                      color={
                        theme[
                          roleId === 'guardian'
                            ? 'primaryBlue'
                            : roleId === 'beneficiary'
                              ? 'primaryGreen'
                              : 'accentGold'
                        ].val
                      }
                    />
                    <Paragraph size='small'>{role?.label ?? ''}</Paragraph>
                  </Row>
                );
              })}
            </Row>

            {/* Contact Info */}
            <Stack space='small'>
              {person.email && (
                <Row
                  align='center'
                  space='xs'
                  onPress={() => handleContactPerson(person, 'email')}
                >
                  <Mail size={16} color={theme.gray6.val} />
                  <Paragraph size='small' color='primary'>
                    {person.email}
                  </Paragraph>
                </Row>
              )}
              {person.phone && (
                <Row
                  align='center'
                  space='xs'
                  onPress={() => handleContactPerson(person, 'phone')}
                >
                  <Phone size={16} color={theme.gray6.val} />
                  <Paragraph size='small' color='primary'>
                    {person.phone}
                  </Paragraph>
                </Row>
              )}
            </Stack>

            {/* Notes */}
            {person.notes && (
              <Paragraph size='small' color='muted' fontStyle='italic'>
                {person.notes}
              </Paragraph>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const roleFilterOptions = [
    { value: 'all', label: 'All Roles' },
    ...PERSON_ROLES.map(role => ({
      value: role.id,
      label: role.label,
    })),
  ];

  return (
    <Container>
      <Stack padding='$4' gap='$4'>
        {/* Header */}
        <Row justify='between' align='center'>
          <Stack>
            <H2>Your Trusted Circle</H2>
            <Paragraph size='small' color='muted'>
              {people.length} {people.length === 1 ? 'person' : 'people'} in
              your circle
            </Paragraph>
          </Stack>
          <Button
            size='medium'
            variant='primary'
            icon={UserPlus}
            onPress={handleAddPerson}
          >
            {media.gtSm ? 'Add Person' : 'Add'}
          </Button>
        </Row>

        {/* Search and Filter */}
        <Stack gap='$3'>
          <Input
            testID='search-input'
            placeholder='Search by name, email, or relationship...'
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={Search}
          />

          <RadioGroup
            options={roleFilterOptions}
            value={selectedRole}
            onValueChange={setSelectedRole}
            orientation='horizontal'
            size='small'
          />
        </Stack>

        <Divider />

        {/* People List */}
        <ScrollContainer
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={loadPeople}
              tintColor={theme.primaryBlue.val}
            />
          }
        >
          {filteredPeople.length === 0 ? (
            <Stack alignItems='center' justifyContent='center' padding='$8'>
              <Shield size={48} color={theme.gray5.val} />
              <Paragraph color='muted' marginTop='$3' textAlign='center'>
                {searchQuery || selectedRole !== 'all'
                  ? 'No people found matching your criteria'
                  : 'Your trusted circle is empty'}
              </Paragraph>
              {!searchQuery && selectedRole === 'all' && (
                <>
                  <Paragraph
                    size='small'
                    color='muted'
                    marginTop='$2'
                    textAlign='center'
                  >
                    Add guardians, beneficiaries, and executors to manage your
                    legacy
                  </Paragraph>
                  <Button
                    variant='primary'
                    marginTop='$4'
                    onPress={handleAddPerson}
                  >
                    Add Your First Person
                  </Button>
                </>
              )}
            </Stack>
          ) : (
            <Stack>
              {/* Statistics */}
              <Card marginBottom='$4'>
                <CardContent>
                  <H3 marginBottom='$3'>Circle Overview</H3>
                  <Row justify='around'>
                    {PERSON_ROLES.map(role => {
                      const count = people.filter(p =>
                        p.roles.includes(role.id)
                      ).length;
                      const Icon = role.icon;
                      return (
                        <Stack key={role.id} alignItems='center' gap='$2'>
                          <Icon
                            size={24}
                            color={
                              theme[
                                role.id === 'guardian'
                                  ? 'primaryBlue'
                                  : role.id === 'beneficiary'
                                    ? 'primaryGreen'
                                    : 'accentGold'
                              ].val
                            }
                          />
                          <Paragraph fontWeight='600' fontSize='$5'>
                            {count}
                          </Paragraph>
                          <Paragraph size='small' color='muted'>
                            {role.label}
                            {count !== 1 ? 's' : ''}
                          </Paragraph>
                        </Stack>
                      );
                    })}
                  </Row>
                </CardContent>
              </Card>

              {/* People Cards */}
              {media.gtSm ? (
                <Grid columns={media.gtMd ? 3 : 2} gap='small'>
                  {filteredPeople.map(renderPersonCard)}
                </Grid>
              ) : (
                <Stack>{filteredPeople.map(renderPersonCard)}</Stack>
              )}
            </Stack>
          )}
        </ScrollContainer>
      </Stack>
    </Container>
  );
};

export default PeopleScreen;
