import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';

import { useSettings } from '../../context/SettingsContext';
import { settingsService } from '../../services/settingsService';
import { NBA_TEAMS_DATA } from '../../data/teamsList';

export default function SettingsScreen() {
  const { settings, dispatch } = useSettings();
  const [selectedTeam, setSelectedTeam] = useState(settings.defaultTeam);
  const [selectedPool, setSelectedPool] = useState(settings.defaultPlayerPool);
  const [selectedRounds, setSelectedRounds] = useState(settings.defaultRounds.toString());

  // Initialize local state when settings change
  useEffect(() => {
    setSelectedTeam(settings.defaultTeam);
    setSelectedPool(settings.defaultPlayerPool);
    setSelectedRounds(settings.defaultRounds.toString());
  }, [settings]);

  const updateSettings = (key, value) => {
    dispatch({
      type: 'UPDATE_DEFAULT_SETTINGS',
      settings: { [key]: value }
    });
  };

  // Format team data with logos
  const teamData = NBA_TEAMS_DATA.map(team => ({
    value: team.name,
    label: team.name,
    logo: team.logo,
  }));

  // Format rounds data once
  const roundsData = [5, 7, 10, 12, 15].map(num => ({ 
    value: num.toString(),
    label: num.toString() + ' Rounds'
  }));

  // Format pool data once
  const poolData = settingsService.getPlayerPools().map(pool => ({
    value: pool.value,
    label: pool.label || pool.value
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Default Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Favorite Team</Text>
        <Dropdown
          data={teamData}
          labelField="label"
          valueField="value"
          value={selectedTeam}
          onChange={item => {
            setSelectedTeam(item.value);
            updateSettings('defaultTeam', item.value);
          }}
          search
          searchPlaceholder="Search for a team..."
          placeholder="Select a team"
          style={styles.dropdown}
          selectedTextStyle={styles.selectedTextStyle}
          placeholderStyle={styles.placeholderStyle}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Default Player Pool</Text>
        <Dropdown
          data={poolData}
          labelField="label"
          valueField="value"
          value={selectedPool}
          onChange={item => {
            setSelectedPool(item.value);
            updateSettings('defaultPlayerPool', item.value);
          }}
          placeholder="Select player pool"
          style={styles.dropdown}
          selectedTextStyle={styles.selectedTextStyle}
          placeholderStyle={styles.placeholderStyle}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Default Draft Rounds</Text>
        <Dropdown
          data={roundsData}
          labelField="label"
          valueField="value"
          value={selectedRounds}
          onChange={item => {
            setSelectedRounds(item.value);
            updateSettings('defaultRounds', parseInt(item.value));
          }}
          placeholder="Select number of rounds"
          style={styles.dropdown}
          selectedTextStyle={styles.selectedTextStyle}
          placeholderStyle={styles.placeholderStyle}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdown: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  selectedTextStyle: {
    color: '#000',
    fontSize: 16,
  },
  placeholderStyle: {
    color: '#666',
    fontSize: 16,
  },
});