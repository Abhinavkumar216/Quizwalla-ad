import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useState, useEffect} from 'react';
import {
  Image,
  Pressable,
  SectionList,
  StatusBar,
  Text,
  View,
  BackHandler,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useCreateTeamMutation,
  useUpcomingSquadQuery,
} from '../../../Services/API/UpcomingAPI';
import ButtonFull from '../../../components/ButtonFull';
import ErrorState from '../../../components/ErrorState';
import Loading from '../../../components/Loading';
import {showToast} from '../../../Services/Functions/AuthFunction';

const SelectTeams = () => {
  const {
    params: {MatchId, team1, team1Flag, team2, team2Flag},
  } = useRoute();
  const navigation = useNavigation();

  const [onCreateTeam] = useCreateTeamMutation();

  const {isError, error, isLoading, isSuccess, data} =
    useUpcomingSquadQuery(MatchId);

  // const [masterTeam, setMasterTeam] = useState();
  const [myTeams, setmyTeams] = useState([]);

  // console.log(myTeams)
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Discard Team', 'Your Team will not saved. are you sure?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: () => {
            navigation.pop();
          },
        },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  const onNextClick = async () => {
    // console.log('myteams =>');
    if (myTeams.filter(item => item.isCaptain === true).length === 0) {
      console.warn('Must Be a Captain in Team');
      showToast({
        type: 'info',
        heading: 'Captain Not Selected',
        subheading: 'Must Be a Captain in Team',
      });

      return;
    }
    if (myTeams.filter(item => item.isViceCaptain === true).length === 0) {
      console.warn('Must Be a Vice Captain in Team');
      showToast({
        type: 'info',
        heading: 'Vice-Captain Not Selected',
        subheading: 'Must Be a Vice Captain in Team',
      });

      return;
    }
    onCreateTeam({matchId: MatchId, team: myTeams})
      .unwrap()
      // .then(payload => console.log('Team Created => ', payload))
      // .catch(error => console.error('Team Create Error => ', error))
      .finally(() => navigation.pop());
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1">
        <TopSection
          team1={team1}
          team1Flag={team1Flag}
          team2={team2}
          team2Flag={team2Flag}
          myTeams={myTeams}
        />
        <SectionList
          sections={data}
          renderItem={({item}) => {
            return (
              <PlayersItem
                item={item}
                setmyTeams={setmyTeams}
                myTeams={myTeams}
                key={item._id}
                navigation={navigation}
              />
            );
          }}
          renderSectionHeader={({section}) => (
            <SectionHeader section={section} myTeams={myTeams} />
          )}
          keyExtractor={item => item._id}
          stickySectionHeadersEnabled
        />
        {myTeams?.length == 11 && (
          <ButtonFull
            title={'Save My Team'}
            buttonStyle={'bg-black w-full py-1'}
            textStyle={'text-white'}
            onPress={onNextClick}
          />
        )}
      </SafeAreaView>
    );
  }

  if (isError) {
    return <ErrorState error={error} />;
  }
};

export default SelectTeams;

const SectionHeader = ({section}) => {
  return (
    <View className="bg-white p-3 flex-row">
      <Text className="font-WorksansSemiBold text-xl text-black flex-1">
        {section.title}
      </Text>
    </View>
  );
};

const PlayersItem = ({item, setmyTeams, myTeams}) => {
  const chooseCaptain = id => {
    if (myTeams.length === 0) {
      console.warn('Please select players first');
      showToast({
        type: 'info',
        heading: 'Player Not Selected',
        subheading: 'This player is not selected',
      });

      return;
    }

    const teamId = element => element._id === id;

    if (!myTeams.some(teamId)) {
      console.warn('Please select this player first');
      showToast({
        type: 'info',
        heading: 'Player Not Selected',
        subheading: 'This player is not selected',
      });

      return;
    }

    const myCaptain = myTeams.filter(item => item.isCaptain);

    if (myCaptain.length === 0) {
      const newTeams = myTeams.map(item =>
        item._id === id ? {...item, isCaptain: true} : item,
      );
      setmyTeams(newTeams);
    } else {
      const newTeams = myTeams.map(item =>
        item._id === id
          ? {...item, isCaptain: true}
          : {...item, isCaptain: false},
      );
      setmyTeams(newTeams);
    }
  };

  const chooseViceCaptain = id => {
    if (myTeams.length === 0) {
      console.warn('Please select players first');
      showToast({
        type: 'info',
        heading: 'Player Not Selected',
        subheading: 'This player is not selected',
      });
      return;
    }

    const teamId = element => element._id === id;

    if (!myTeams.some(teamId)) {
      console.warn('Please select this player first');
      showToast({
        type: 'info',
        heading: 'Player Not Selected',
        subheading: 'This player is not selected',
      });
      return;
    }

    const myViceCaptain = myTeams.filter(item => item.isViceCaptain);

    if (myViceCaptain.length === 0) {
      const newTeams = myTeams.map(item =>
        item._id === id ? {...item, isViceCaptain: true} : item,
      );
      setmyTeams(newTeams);
    } else {
      const newTeams = myTeams.map(item =>
        item._id === id
          ? {...item, isViceCaptain: true}
          : {...item, isViceCaptain: false},
      );
      setmyTeams(newTeams);
    }
  };

  const handleSelection = useCallback(
    item => {
      if (myTeams?.length >= 11) {
        // console.warn('Maximum of 11 players from one team');
        showToast({
          type: 'info',
          heading: 'Player Exceed',
          subheading: 'Maximum of 11 players from one team',
        });
        return;
      }
      if (myTeams?.length < 0) {
        setmyTeams(item);
      } else if (myTeams?.filter(team => team?._id === item._id)?.length > 0) {
        let removeItem = myTeams?.filter(team => team?._id !== item._id);
        setmyTeams(removeItem);
      } else {
        setmyTeams(prev => [
          ...prev,
          {
            _id: item._id,
            playerId: item.id,
            name: item.name,
            role: item.role,
            team: item.team,
            isCaptain: false,
            isViceCaptain: false,
          },
        ]);
      }
    },
    [item, myTeams],
  );

  return (
    <View className="flex-row justify-between items-center border-b border-neutral-200">
      <View className=" flex-row flex-1">
        <Pressable
        // onPress={() => navigation.push('PlayerProfile', {item: item})}
        >
          <Image source={{uri: item?.image}} className="w-20 h-20" />
          <Text className="bg-black text-white absolute bottom-0 px-1 font-WorksansRegular">
            {item?.team}
          </Text>
        </Pressable>
        <View className="ml-3 justify-center">
          <Text className="font-WorksansMedium text-lg text-black">
            {item.name.slice(0, 15)}
          </Text>
          <Text className="font-WorksansRegular text-sm text-gray-500">
            {item.role}
          </Text>
        </View>
      </View>
      <View className="flex-row ">
        <Pressable
          disabled={myTeams[myTeams.findIndex(obj => obj._id == item._id)]?.isViceCaptain ==
            true}
          onPress={() => chooseCaptain(item._id)}
          className=" items-center justify-center">
          <MyCaptain item={item} myTeams={myTeams} />
        </Pressable>

        <View className="w-2" />

        <Pressable
        disabled={myTeams[myTeams.findIndex(obj => obj._id == item._id)]?.isCaptain == true}
          onPress={() => chooseViceCaptain(item._id)}
          className=" items-center justify-center">
          <MyViceCaptain item={item} myTeams={myTeams} />
        </Pressable>
      </View>
      <Pressable className="mr-2 p-4" onPress={() => handleSelection(item)}>
        {myTeams?.filter(team => team?._id === item._id)?.length > 0 ? (
          <Icon name="checkmark-circle-outline" size={26} color={'green'} />
        ) : (
          <Icon name="add-circle-outline" size={26} color={'black'} />
        )}
      </Pressable>
    </View>
  );
};

const TopSection = ({team1, team1Flag, team2, team2Flag, myTeams}) => {
  // console.log((myTeams?.length / 11).toFixed(1));

  return (
    <View className="bg-black p-5 pt-2 border-red-600">
      <Text className="font-WorksansRegular text-center text-white text-base">
        Maximum of 11 players from one team
      </Text>
      <TopWrap
        team1={team1}
        team1Flag={team1Flag}
        team2={team2}
        team2Flag={team2Flag}
        myTeams={myTeams}
      />
      <View
        className=" bg-white h-5 flex-1 rounded-xl mb-2"
        style={{flex: 1, flexDirection: 'row'}}>
        <View
          className="bg-green-500 z-10 h-3 rounded-xl"
          style={{flex: myTeams?.length / 11}}
        />
      </View>
    </View>
  );
};

const TopWrap = ({team1, team1Flag, team2, team2Flag, myTeams}) => {
  return (
    <View className=" border-orange-500 flex-row my-2 py-2">
      <View className=" flex-1 flex-row justify-evenly items-center">
        <Image
          source={{uri: team1Flag}}
          className="h-10 w-10 "
          resizeMode="contain"
        />
        <View className="items-center">
          <Text className=" font-WorksansRegular text-neutral-300">
            {team1}
          </Text>
          <Text className="text-white font-WorksansSemiBold text-lg">
            {myTeams?.filter(team => team?.team === team1)?.length}
          </Text>
        </View>
        <View>
          <Text className="text-neutral-300 font-WorksansRegular">Players</Text>
          <Text className="text-white font-WorksansRegular text-lg text-center">
            <Text className="font-WorksansSemiBold text-center">
              {myTeams?.length}
            </Text>
            /11
          </Text>
        </View>
        <View className="items-center">
          <Text className=" font-WorksansRegular text-neutral-300">
            {team2}
          </Text>
          <Text className="text-white font-WorksansSemiBold text-lg">
            {myTeams?.filter(team => team?.team === team2)?.length}
          </Text>
        </View>

        <View>
          <Image
            source={{uri: team2Flag}}
            className="h-10 w-10"
            resizeMode="contain"
          />
        </View>
        {/* <View>
          <Text className="text-white font-WorksansRegular text-xs">
            Credits Left
          </Text>
          <Text className="text-white text-right font-WorksansSemiBold text-lg">
            100
          </Text>
        </View> */}
      </View>
    </View>
  );
};

const MyCaptain = ({item, myTeams}) => {
  if (
    myTeams[myTeams.findIndex(obj => obj._id == item._id)]?.isCaptain == true
  ) {
    return (
      <View className="bg-black w-8 h-8 justify-center items-center rounded-full">
        <Text className="font-WorksansMedium text-white text-cente">2x</Text>
      </View>
    );
  } else {
    return (
      <Image
        source={require('../../../../assets/icons/c.png')}
        className="w-8 h-8"
      />
    );
  }
};
const MyViceCaptain = ({item, myTeams}) => {
  if (
    myTeams[myTeams.findIndex(obj => obj._id == item._id)]?.isViceCaptain ==
    true
  ) {
    return (
      <View className="bg-black w-8 h-8 justify-center items-center rounded-full">
        <Text className="font-WorksansMedium text-white text-cente">1.5x</Text>
      </View>
    );
  } else {
    return (
      <Image
        source={require('../../../../assets/icons/vc.png')}
        className="w-8 h-8"
      />
    );
  }
};
