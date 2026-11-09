import { useContext, useEffect, useState } from 'react'
import {
  StyleSheet,
  FlatList,
  View,
  Pressable,
  ImageBackground,
  Image
} from 'react-native'
import {
  getOrderFromRider,
  disqualifyRider
} from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemiBold'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { API_BASE_URL } from '@env'

export default function RiderDeliveriesScreen({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route])

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getOrderFromRider(route.params.riderId)
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving orders from rider ${route.params.riderId}. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  // Already implemented: Call to the endpoint (RF-4)
  const handleDisqualifyRider = async id => {
    try {
      await disqualifyRider(id)
      showMessage({
        message: `Rider #${id} confirmed as disqualified!`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      await fetchOrders()
    } catch (error) {
      showMessage({
        message: `Could not disqualify the rider #${id}. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  // --

  const renderOrder = ({ item }) => {
    return (
      <ImageCard
        imageUri={
          item.restaurant.logo
            ? { uri: API_BASE_URL + '/' + item.restaurant.logo }
            : restaurantLogo
        }
        title={`Order #${item.id} - ${item.restaurant.name}`}
      >
        <TextSemiBold>
          <MaterialCommunityIcons
            name="map-marker"
            size={14}
            color={GlobalStyles.brandPrimary}
          />{' '}
          <TextRegular textStyle={{ color: GlobalStyles.brandPrimary }}>
            {item.user.firstName} ({item.user.phone}) — {item.address}
          </TextRegular>
        </TextSemiBold>
        <TextSemiBold>
          <MaterialCommunityIcons name="cash" size={14} color={'#555'} />{' '}
          <TextRegular>{item.price.toFixed(2)}€</TextRegular>
        </TextSemiBold>
        <TextSemiBold>
          {item.deliveredAt ? (
            <TextRegular textStyle={{ color: GlobalStyles.brandGreen }}>
              Delivered
            </TextRegular>
          ) : item.sentAt ? (
            <TextRegular textStyle={{ color: GlobalStyles.brandBlue }}>
              Picked up — pending delivery
            </TextRegular>
          ) : (
            <TextRegular textStyle={{ color: GlobalStyles.brandBlue }}>
              Assigned — pending pickup
            </TextRegular>
          )}
        </TextSemiBold>
        <TextRegular textStyle={{ color: GlobalStyles.brandBlue }}>
          <MaterialCommunityIcons
            name="truck-delivery-outline"
            size={14}
            color={GlobalStyles.brandBlue}
          />{' '}
          Rider comments: {item.riderComments}
        </TextRegular>

        <TextRegular textStyle={{ color: GlobalStyles.brandBlue }}>
          <MaterialCommunityIcons
            name="human-child"
            size={14}
            color={GlobalStyles.brandBlue}
          />{' '}
          Customer comments: {item.customerComments}
        </TextRegular>

        <TextRegular
          textStyle={
            item.ownerApprove
              ? { color: GlobalStyles.brandGreen }
              : { color: GlobalStyles.brandPrimary }
          }
        >
          <MaterialCommunityIcons
            name="abacus"
            size={14}
            color={
              item.ownerApprove
                ? { color: GlobalStyles.brandGreen }
                : { color: GlobalStyles.brandPrimary }
            }
          />{' '}
          {item.ownerApprove
            ? 'Delivery approved by owner'
            : 'Delivery disapproved by owner'}
        </TextRegular>
      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        You have no orders assigned. Pick up an available order to get started.
      </TextRegular>
    )
  }

  const renderHeader = () => {
    if (orders.length === 0) return null
    let rider = orders[0].rider // Code to be reviewed
    let riderId = orders[0].riderId
    if (!rider) return null
    return (
      <View>
        <ImageBackground
          source={
            rider?.avatar
              ? {
                  uri: API_BASE_URL + '/' + rider.avatar,
                  cache: 'force-cache'
                }
              : undefined
          }
          style={styles.imageBackground}
        >
          <View style={styles.headerContainer}>
            <Image
              style={styles.image}
              source={
                rider.avatar
                  ? {
                      uri: API_BASE_URL + '/' + rider.avatar,
                      cache: 'force-cache'
                    }
                  : undefined
              }
            />
            <TextSemiBold textStyle={styles.textTitle}>
              {rider.lastName} {rider.firstName}
            </TextSemiBold>
            {!rider.isQualifiedRider && (
              <TextSemiBold textStyle={styles.textTitleRed}>
                (disqualified)
              </TextSemiBold>
            )}
            <TextRegular textStyle={styles.description}>
              <MaterialCommunityIcons
                name="information-outline"
                size={14}
                color={'white'}
              />{' '}
              {rider.email}, {rider.phone}
            </TextRegular>
          </View>
        </ImageBackground>

        {/* Already implemented: Button to disqualify a rider (RF-4*) */}
        {rider.isQualifiedRider && (
          <Pressable
            onPress={() => handleDisqualifyRider(riderId)}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.button
            ]}
          >
            <View
              style={[
                { flex: 1, flexDirection: 'row', justifyContent: 'center' }
              ]}
            >
              <MaterialCommunityIcons
                name="emoticon-dead-outline"
                color={'white'}
                size={20}
              />
              <TextRegular textStyle={styles.text}>
                Disqualify rider
              </TextRegular>
            </View>
          </Pressable>
        )}
        {/* -- */}
      </View>
    )
  }

  return (
    <FlatList
      style={styles.container}
      data={orders}
      renderItem={renderOrder}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyOrdersList}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '100%'
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
  headerContainer: {
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
  textTitleRed: {
    fontSize: 20,
    color: GlobalStyles.brandPrimary
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  }
})
