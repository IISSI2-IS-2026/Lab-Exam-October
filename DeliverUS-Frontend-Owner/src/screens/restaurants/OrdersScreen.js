import React, { useContext, useEffect, useState } from 'react'
import {
  StyleSheet,
  FlatList,
  View,
  ImageBackground,
  Image,
  Pressable
} from 'react-native'
import {
  // Solution (E4): Import the needed enpoints
  // --
} from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemiBold'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import pendingIcon from '../../../assets/timer-sand.jpg'
import inProcessIcon from '../../../assets/chef-hat.jpg'
import sentIcon from '../../../assets/truck-delivery.jpg'
import deliveredIcon from '../../../assets/food.jpg'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { API_BASE_URL } from '@env'

const getElapsedMinutes = dateString => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  return Math.floor(diffMs / 60000)
}

export default function OrdersScreen({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders() // Solution (E4): Function to be implemented
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route])

  // Solution (E4): Call to toggle endpoint
  const handleToogle = async item => {
  }
  // --

  // Solution (E4): Function to decide which toggle button is shown (approve / disappove)
  const decideButton = item => {
  }
  // --

  const renderOrder = ({ item }) => {
    let logo

    if (item.status === 'pending') logo = pendingIcon
    else if (item.status === 'in process') logo = inProcessIcon
    else if (item.status === 'sent') logo = sentIcon
    else logo = deliveredIcon

	// Solution: Including rider first name in title
    const riderName = item.rider ? ' - ' + item.rider.firstName : ' '
	
    return (
      <ImageCard
        imageUri={logo}
        title={`Order #${item.id} - ${item.status} ${riderName}`}
      >
        <View style={styles.timeBadgeAbsolute}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={12}
            color={'white'}
          />
          <TextRegular textStyle={styles.timeBadgeText}>
            {getElapsedMinutes(item.createdAt)} min
          </TextRegular>
        </View>

        {/* Solution (E4): Views for current info to be displayed in two columns */}
        <View style={styles.columnsContainer}>
          <View style={styles.columnView}> {/* View for first column */}
          </View>
          <View style={styles.columnView}> {/* View for second column */}
          </View>
        </View>

        {/* Solution (E4): View for buttons: Decide buttons and configure the style */}
        <View
          /*style={ }*/
        >
          {/* Buttons here */}

          {/* Already implemented: Button to accepted orders by a rider (RF-3) */}
          <Pressable
            onPress={() =>
              navigation.navigate('RiderDeliveriesScreen', {
                riderId: item.riderId,
                restaurantId: item.restaurantId
              })
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
            ]}
          >
            <View
              style={[
                { flex: 1, flexDirection: 'row', justifyContent: 'center' }
              ]}
            >
              <MaterialCommunityIcons name="abacus" color={'white'} size={20} />
              <TextRegular textStyle={styles.text}>
                View {item.rider ? item.rider.firstName : ''} deliveries
              </TextRegular>
            </View>
          </Pressable>
        </View>
      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No orders were retrieved!
      </TextRegular>
    )
  }

  const renderHeader = () => {
    if (orders.length === 0) return null
    let restaurant = orders[0].restaurant // Code to be reviewed
    if (!restaurant) return null
    return (
      <View>
        <ImageBackground
          source={
            restaurant?.heroImage
              ? {
                  uri: API_BASE_URL + '/' + restaurant.heroImage,
                  cache: 'force-cache'
                }
              : undefined
          }
          style={styles.imageBackground}
        >
          <View style={styles.restaurantHeaderContainer}>
            <Image
              style={styles.image}
              source={
                restaurant.logo
                  ? {
                      uri: API_BASE_URL + '/' + restaurant.logo,
                      cache: 'force-cache'
                    }
                  : restaurantLogo
              }
            />
            <TextSemiBold textStyle={styles.textTitle}>
              {restaurant.name}
            </TextSemiBold>
            <TextRegular textStyle={styles.description}>
              <MaterialCommunityIcons name="store" size={14} color={'white'} />{' '}
              {restaurant.address}, {restaurant.postalCode}
            </TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const fetchOrders = async () => {
    // Solution (E4): Complete the function to get the restaurant orders
    // --
  }

  return (
    <>
      <FlatList
        style={styles.container}
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyOrdersList}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  showActionButton: {
    visibility: 'visible'
  },
  hideActionButton: {
    visibility: 'hidden'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  timeBadgeAbsolute: {
    position: 'absolute',
    top: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GlobalStyles.brandPrimary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  timeBadgeText: {
    color: 'white',
    fontSize: 11,
    marginLeft: 3
  },
  restaurantHeaderContainer: {
    height: 225,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white',
    marginTop: 4
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  // Solution (E4 / E6): Configure for Two columns style
  columnsContainer: {
  },
  columnView: {
  },
  // --
})
