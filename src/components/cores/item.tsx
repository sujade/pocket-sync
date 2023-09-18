import { useRecoilValue } from "recoil"
import {
  CoreAuthorImageSelectorFamily,
  CoreInfoSelectorFamily,
  CoreMainPlatformIdSelectorFamily,
} from "../../recoil/selectors"

import { PlatformInfoSelectorFamily } from "../../recoil/platforms/selectors"
import { PlatformImage } from "./platformImage"

import "./index.css"
import { Version } from "./version"
import { SearchContextSelfHidingConsumer } from "../search/context"
import { InventoryItem } from "../../types"
import { useUpdateAvailable } from "../../hooks/useUpdateAvailable"
import { KeyIcon } from "./keyIcon"
import { useTranslation } from "react-i18next"
import { useInventoryItem } from "../../hooks/useInventoryItem"

type CoreItemProps = {
  coreName: string
  onClick: () => void
}

export const CoreItem = ({ coreName, onClick }: CoreItemProps) => {
  const { core } = useRecoilValue(CoreInfoSelectorFamily(coreName))
  const imageSrc = useRecoilValue(CoreAuthorImageSelectorFamily(coreName))
  const mainPlatformId = useRecoilValue(
    CoreMainPlatformIdSelectorFamily(coreName)
  )
  const { platform } = useRecoilValue(
    PlatformInfoSelectorFamily(mainPlatformId)
  )
  const canUpdate = useUpdateAvailable(coreName)
  const inventoryItem = useInventoryItem(coreName)

  console.log({ inventoryItem })

  return (
    <SearchContextSelfHidingConsumer
      fields={[
        core.metadata.shortname,
        core.metadata.author,
        platform.manufacturer,
        platform.name,
        platform.category || "",
        `${platform.year}`,
      ]}
      otherFn={({ onlyUpdates, category }) => {
        if (category !== "All") {
          if (platform.category !== category) return false
        }

        if (!onlyUpdates) return true
        return canUpdate !== null
      }}
    >
      <div className="cores__item" role="button" onClick={onClick}>
        <PlatformImage
          className="cores__platform-image"
          platformId={mainPlatformId}
        />

        <div className="cores__info-blurb">
          <div className="cores__info-blurb-name">
            {core.metadata.shortname}
          </div>

          <Version coreName={coreName} />

          <div className="cores__author-tag">
            <img className="cores__author-tag-image" src={imageSrc} />
            {core.metadata.author}
          </div>
        </div>
        {inventoryItem && inventoryItem.requires_license && <SponsorBanner />}
      </div>
    </SearchContextSelfHidingConsumer>
  )
}

type NotInstalledCoreItemProps = {
  inventoryItem: InventoryItem
  onClick: () => void
}

export const NotInstalledCoreItem = ({
  inventoryItem,
  onClick,
}: NotInstalledCoreItemProps) => {
  const { platform_id, identifier, platform, requires_license } = inventoryItem

  return (
    <SearchContextSelfHidingConsumer
      fields={[platform_id, identifier, inventoryItem.repository?.owner || ""]}
      otherFn={({ category }) => {
        if (category === "All") return true
        return category === platform.category
      }}
    >
      <div className="cores__item cores__item--not-installed" onClick={onClick}>
        <div>{platform_id}</div>
        <div className="cores__not-installed-item-id">{identifier}</div>
        {requires_license && <SponsorBanner />}
      </div>
    </SearchContextSelfHidingConsumer>
  )
}

const SponsorBanner = () => {
  const { t } = useTranslation("core_info")
  return (
    <div
      className="cores__item-sponsor-banner"
      title={t("requires_license.all")}
    >
      <KeyIcon />
    </div>
  )
}
