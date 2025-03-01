import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

import { useDraft, useSettings } from '../../context/DraftContext';
import { calculateTeamScore } from '../../utils/scoringUtils';
import { getFeedbackMessage } from '../../utils/feedbackUtils';


export default function EvaluationScreen() {
    const { state, dispatch } = useDraft();
    const [expandedTeamId, setExpandedTeamId] = useState(null);

    // Get user team
    // const userTeam = state.teams.find(team => team.isUser);
    
    // Safety check - if no valid state, return to home
    useEffect(() => {
        // console.log("Saftey check");
        if (!state.draftComplete || !state.draftedPlayers?.length) {
            // console.log('Draft not complete or no teams - returning to home');
            router.replace('/');
            return;
        }
    }, [state.draftedPlayers, state.draftComplete]);

    // Get user team with safety check
    const userTeam = state.teams?.find(team => team.isUser);
    if (!userTeam) {
        return null;
    }

    const teamScoreData = calculateTeamScore(userTeam.roster);

    // Get AI teams and their scores
    const aiTeams = state.teams
        .filter(team => !team.isUser)
        .map(team => ({
            ...team,
            scoreData: calculateTeamScore(team.roster)
        }))
        .sort((a, b) => b.scoreData - a.scoreData);

    // console.log("aiTeams", aiTeams);

    // Handler for team row clicks
    const toggleTeamExpansion = (teamId) => {
        setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
    };

    // Render player stats row
    const renderPlayerStats = (player) => (
        <View key={player.id} style={styles.playerRow}>
            <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
            <Text style={styles.playerPosition}>
                {player.primaryPosition}{player.secondaryPosition ? `/${player.secondaryPosition}` : ''}
            </Text>
            <Text style={styles.playerRating}>{player.overall_rating}</Text>
        </View>
    );

    const handleReturnHome = () => {
        // console.log('Resetting draft state...');
        dispatch({ type: 'RESET_DRAFT' });
        // Remove players from state
        const { availablePlayers, draftedPlayers, ...rest } = state;
        const newState = {
            ...rest,
            availablePlayers: availablePlayers.length,
            draftedPlayers: draftedPlayers.length
        };
        // console.log('State after reset:', newState);
        router.replace('/');
    };

    if (!state.draftedPlayers?.length || !state.draftComplete) {
        return (
            <View style={styles.container}>
              <Text>Loading...</Text>
            </View>
          );
    }

    return (
        <ScrollView style={styles.container}>
            {/* User Team Section */}
            <View style={styles.userSection}>
                <Text style={styles.headerText}>Your Draft Results</Text>
                <Text style={styles.scoreText}>Overall Score: {teamScoreData.score}</Text>
                <Text style={styles.feedbackText}>{getFeedbackMessage(teamScoreData)}</Text>

                <View style={styles.rosterHeader}>
                    <Text style={[styles.columnHeader, styles.playerName]}>Player</Text>
                    <Text style={[styles.columnHeader, styles.playerPosition]}>Pos</Text>
                    <Text style={[styles.columnHeader, styles.playerRating]}>OVR</Text>
                </View>

                {userTeam.roster.map(renderPlayerStats)}
            </View>

            {/* AI Teams Section */}
            <View style={styles.aiSection}>
                <Text style={styles.headerText}>Other Teams</Text>

                {aiTeams.map(team => (
                    <View key={team.id}>
                        <TouchableOpacity
                            style={styles.teamRow}
                            onPress={() => toggleTeamExpansion(team.id)}
                        >
                            <Text style={styles.teamName}>{team.name}</Text>
                            <Text style={styles.teamScore}>Score: {team.scoreData.score}</Text>
                            <Text style={styles.expandIcon}>
                                {expandedTeamId === team.id ? '▼' : '▶'}
                            </Text>
                        </TouchableOpacity>

                        {expandedTeamId === team.id && (
                            <View style={styles.expandedContent}>
                                <View style={styles.rosterHeader}>
                                    <Text style={[styles.columnHeader, styles.playerName]}>Player</Text>
                                    <Text style={[styles.columnHeader, styles.playerPosition]}>Pos</Text>
                                    <Text style={[styles.columnHeader, styles.playerRating]}>OVR</Text>
                                </View>
                                {team.roster.map(renderPlayerStats)}
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {/* Return Button */}
            <TouchableOpacity
                style={styles.returnButton}
                onPress={handleReturnHome}
            >
                <Text style={styles.returnButtonText}>Return to Home</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    userSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        elevation: 2,
    },
    aiSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        elevation: 2,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    scoreText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        color: '#2c5282',
    },
    feedbackText: {
        fontSize: 16,
        marginBottom: 16,
        color: '#4a5568',
        fontStyle: 'italic',
    },
    rosterHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    columnHeader: {
        fontWeight: '600',
        color: '#4a5568',
    },
    playerRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#edf2f7',
        alignItems: 'center',
    },
    playerName: {
        flex: 3,
        color: '#2d3748',
        paddingRight: 8,
    },
    playerPosition: {
        flex: 1,
        color: '#4a5568',
        textAlign: 'center',
    },
    playerRating: {
        width: 50,
        color: '#2c5282',
        fontWeight: '500',
        textAlign: 'right',
    },
    teamRow: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        alignItems: 'center',
    },
    teamName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#2d3748',
    },
    teamScore: {
        marginRight: 8,
        color: '#2c5282',
        fontWeight: '500',
    },
    expandIcon: {
        fontSize: 16,
        color: '#4a5568',
    },
    expandedContent: {
        padding: 16,
        backgroundColor: '#f8fafc',
    },
    returnButton: {
        backgroundColor: '#2c5282',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    returnButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});